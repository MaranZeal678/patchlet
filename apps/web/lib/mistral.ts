import { DEFAULT_VOICE, EMBED_DIMENSIONS, MODELS } from "@patchlet/shared";
import { mistralApiKey } from "./env";

const BASE_URL = "https://api.mistral.ai/v1";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** A JSON Schema object describing the shape a structured call must return. */
export type JsonSchema = Record<string, unknown>;

async function call(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${mistralApiKey()}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Mistral ${path} failed with ${response.status}: ${detail.slice(0, 400)}`);
  }
  return response;
}

async function postJson(path: string, body: unknown): Promise<Response> {
  return call(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Reasoning models return `content` as an array of thinking and text parts rather than a string,
 * so every reader goes through here.
 */
function readContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) =>
      typeof part === "object" && part !== null && "text" in part
        ? String((part as { text: unknown }).text ?? "")
        : "",
    )
    .join("");
}

function firstMessageContent(payload: unknown): string {
  const choices = (payload as { choices?: { message?: { content?: unknown } }[] }).choices;
  return readContent(choices?.[0]?.message?.content);
}

/** Plain text completion. */
export async function chatText(
  model: string,
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const temperature = options.temperature ?? 0;
  const response = await postJson("/chat/completions", {
    model,
    messages,
    // The API rejects temperature 0 unless top_p is pinned to 1.
    temperature,
    ...(temperature === 0 ? { top_p: 1 } : {}),
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
  });
  return firstMessageContent(await response.json());
}

/**
 * Structured completion. The schema is enforced by the API, but the result is still model output,
 * so callers validate the parsed value before trusting its shape.
 */
export async function chatJson<T>(
  model: string,
  messages: ChatMessage[],
  schema: JsonSchema,
  options: { name?: string; maxTokens?: number } = {},
): Promise<T> {
  const response = await postJson("/chat/completions", {
    model,
    messages,
    temperature: 0,
    top_p: 1,
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    response_format: {
      type: "json_schema",
      json_schema: { name: options.name ?? "result", schema, strict: true },
    },
  });
  const text = firstMessageContent(await response.json());
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Mistral ${model} returned text that is not JSON: ${text.slice(0, 200)}`);
  }
}

/** Embeds a batch of texts. Asserts the width the schema and `match_chunks` are built around. */
export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await postJson("/embeddings", { model: MODELS.embed, input: texts });
  const payload = (await response.json()) as { data?: { embedding?: unknown }[] };
  const vectors = (payload.data ?? []).map((entry) => entry.embedding);

  if (vectors.length !== texts.length) {
    throw new Error(`Expected ${texts.length} embeddings, received ${vectors.length}`);
  }
  return vectors.map((vector, index) => {
    if (!Array.isArray(vector) || vector.length !== EMBED_DIMENSIONS) {
      const width = Array.isArray(vector) ? vector.length : "none";
      throw new Error(`Embedding ${index} has width ${width}, expected ${EMBED_DIMENSIONS}`);
    }
    return vector as number[];
  });
}

export type OcrBlock = {
  /** What the reader thought this region is: "title", "text", "table", and so on. */
  type: string;
  /** The region's own markdown, so a low-confidence block can be shown on its own. */
  content: string;
  confidence: number | null;
};
export type OcrPage = {
  index: number;
  markdown: string;
  confidence: number | null;
  blocks: OcrBlock[];
};
export type OcrResult = { pages: OcrPage[] };

/** Runs OCR over a document supplied as a data URL. */
export async function ocr(dataUrl: string): Promise<OcrResult> {
  const response = await postJson("/ocr", {
    model: MODELS.ocr,
    document: { type: "document_url", document_url: dataUrl },
    include_blocks: true,
    confidence_scores_granularity: "block",
  });
  const payload = (await response.json()) as {
    pages?: {
      index?: number;
      markdown?: string;
      confidence_scores?: { average_page_confidence_score?: number };
      blocks?: {
        type?: string;
        content?: string;
        confidence_scores?: { average_content_confidence_score?: number };
      }[];
    }[];
  };

  return {
    pages: (payload.pages ?? []).map((page, index) => ({
      index: page.index ?? index,
      markdown: page.markdown ?? "",
      confidence: page.confidence_scores?.average_page_confidence_score ?? null,
      blocks: (page.blocks ?? []).map((block) => ({
        type: block.type ?? "text",
        content: block.content ?? "",
        confidence: block.confidence_scores?.average_content_confidence_score ?? null,
      })),
    })),
  };
}

/** Transcribes an audio file. */
export async function transcribe(file: Blob, filename = "audio.webm"): Promise<string> {
  const form = new FormData();
  form.set("model", MODELS.transcribe);
  form.set("file", file, filename);
  const response = await call("/audio/transcriptions", { method: "POST", body: form });
  const payload = (await response.json()) as { text?: string };
  return payload.text ?? "";
}

/**
 * Streams speech as mp3 chunks. The API sends base64 audio in server-sent `speech.audio.delta`
 * events, so yielding each decoded chunk lets the caller start playing before the whole utterance
 * has been synthesised.
 */
export async function* speakStream(
  text: string,
  voice: string = DEFAULT_VOICE,
): AsyncGenerator<Uint8Array> {
  const response = await postJson("/audio/speech", {
    model: MODELS.speak,
    input: text,
    voice,
    response_format: "mp3",
    stream: true,
  });
  if (!response.body) throw new Error("Mistral /audio/speech returned no body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Server-sent events are separated by a blank line; hold back the trailing partial event.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      for (const line of event.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "" || data === "[DONE]") continue;
        let audio: unknown;
        try {
          audio = (JSON.parse(data) as { audio_data?: unknown }).audio_data;
        } catch {
          continue;
        }
        if (typeof audio === "string" && audio.length > 0) {
          yield Uint8Array.from(Buffer.from(audio, "base64"));
        }
      }
    }
  }
}

/** Liveness check used by `/api/health`. */
export async function listModels(): Promise<boolean> {
  const response = await call("/models", { method: "GET" });
  return response.ok;
}
