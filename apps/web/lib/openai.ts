/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * The one model file. One base URL, one key, OpenAI-shaped requests throughout.
 *
 * With OPENAI_API_KEY set this speaks to the OpenAI platform (GPT-5 for
 * reasoning and codegen, text-embedding-3-large pinned to 1024 dimensions so
 * the vector width never changes). Without it, it falls back to the
 * OpenAI-compatible Mistral endpoint using MISTRAL_API_KEY, because a demo
 * that needs a key you don't have is not a demo. Same requests, same shapes,
 * different base URL — which is the whole point of having exactly one file.
 */
import { EMBED_DIMENSIONS } from "@patchlet/shared";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolSpec = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export type Usage = { promptTokens: number; completionTokens: number; totalTokens: number };

/** A JSON Schema object describing the shape a structured call must return. */
export type JsonSchema = Record<string, unknown>;

type Provider = { baseUrl: string; key: string; kind: "openai" | "mistral" };

function provider(): Provider {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return { baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1", key: openaiKey, kind: "openai" };
  }
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey) {
    return { baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.mistral.ai/v1", key: mistralKey, kind: "mistral" };
  }
  throw new Error("Set OPENAI_API_KEY (preferred) or MISTRAL_API_KEY in apps/web/.env.local");
}

/** The reasoning/synthesis model. Every call site goes through this. */
export function chatModel(): string {
  return process.env.AC_CHAT_MODEL ?? (provider().kind === "openai" ? "gpt-5.1" : "mistral-medium-latest");
}

/** The codegen model used by the compile stage. */
export function codeModel(): string {
  return process.env.AC_CODE_MODEL ?? (provider().kind === "openai" ? "gpt-5.1-codex" : "devstral-medium-latest");
}

function embedModel(): string {
  return process.env.AC_EMBED_MODEL ?? (provider().kind === "openai" ? "text-embedding-3-large" : "mistral-embed");
}

export function providerLabel(): string {
  try {
    const p = provider();
    return p.kind === "openai" ? `OpenAI (${chatModel()})` : `Mistral via OpenAI-compatible API (${chatModel()})`;
  } catch {
    return "no model key configured";
  }
}

/** GPT-5-generation models only accept the default temperature. */
function samplingFor(model: string): Record<string, number> {
  if (/^(gpt-5|o\d)/.test(model)) return {};
  return { temperature: 0, top_p: 1 };
}

/** Any legacy mistral-* model id from old call sites maps to the active chat model. */
function resolveModel(requested: string): string {
  const p = provider();
  if (p.kind === "openai" && /mistral|voxtral|codestral|devstral|magistral|ministral/.test(requested)) return chatModel();
  return requested;
}

async function call(path: string, init: RequestInit): Promise<Response> {
  const p = provider();
  const response = await fetch(`${p.baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${p.key}`, ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Model API ${path} failed with ${response.status}: ${detail.slice(0, 400)}`);
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

type Completion = {
  choices?: { message?: { content?: unknown; tool_calls?: ToolCall[] }; finish_reason?: string }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
};

function usageOf(payload: Completion): Usage {
  return {
    promptTokens: payload.usage?.prompt_tokens ?? 0,
    completionTokens: payload.usage?.completion_tokens ?? 0,
    totalTokens: payload.usage?.total_tokens ?? 0,
  };
}

/** Plain text completion. */
export async function chatText(
  model: string,
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const resolved = resolveModel(model);
  const response = await postJson("/chat/completions", {
    model: resolved,
    messages,
    ...samplingFor(resolved),
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
  });
  const payload = (await response.json()) as Completion;
  return readContent(payload.choices?.[0]?.message?.content);
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
  const { value } = await chatJsonUsage<T>(model, messages, schema, options);
  return value;
}

/** Structured completion that also reports token usage — the race is metered with this. */
export async function chatJsonUsage<T>(
  model: string,
  messages: ChatMessage[],
  schema: JsonSchema,
  options: { name?: string; maxTokens?: number } = {},
): Promise<{ value: T; usage: Usage }> {
  const resolved = resolveModel(model);
  const response = await postJson("/chat/completions", {
    model: resolved,
    messages,
    ...samplingFor(resolved),
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    response_format: {
      type: "json_schema",
      json_schema: { name: options.name ?? "result", schema, strict: true },
    },
  });
  const payload = (await response.json()) as Completion;
  const text = readContent(payload.choices?.[0]?.message?.content);
  try {
    return { value: JSON.parse(text) as T, usage: usageOf(payload) };
  } catch {
    throw new Error(`${resolved} returned text that is not JSON: ${text.slice(0, 200)}`);
  }
}

/** One round of tool calling: the agent side of a compiled semantic action. */
export async function chatToolsUsage(
  model: string,
  messages: ChatMessage[],
  tools: ToolSpec[],
): Promise<{ message: { content: string; toolCalls: ToolCall[] }; usage: Usage }> {
  const resolved = resolveModel(model);
  const response = await postJson("/chat/completions", {
    model: resolved,
    messages,
    tools,
    tool_choice: "auto",
    ...samplingFor(resolved),
  });
  const payload = (await response.json()) as Completion;
  const message = payload.choices?.[0]?.message;
  return {
    message: { content: readContent(message?.content), toolCalls: message?.tool_calls ?? [] },
    usage: usageOf(payload),
  };
}

/** Embeds a batch of texts, pinned to the width the whole pipeline is built around. */
export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = embedModel();
  const response = await postJson("/embeddings", {
    model,
    input: texts,
    // text-embedding-3-large is 3072-wide by default; pinning it keeps the
    // stored vectors valid if the provider changes underneath us.
    ...(model.startsWith("text-embedding-3") ? { dimensions: EMBED_DIMENSIONS } : {}),
  });
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

/** True when the configured key can list models — the health route's liveness check. */
export async function listModels(): Promise<boolean> {
  try {
    await call("/models", { method: "GET" });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Legacy Patchlet surfaces not carried into Action Compiler.          */
/* ------------------------------------------------------------------ */

export type OcrBlock = { type: string; content: string; confidence: number | null };
export type OcrPage = { index: number; markdown: string; confidence: number | null; blocks: OcrBlock[] };
export type OcrResult = { pages: OcrPage[] };

export async function ocr(_dataUrl: string): Promise<OcrResult> {
  throw new Error("Document OCR is not part of Action Compiler");
}

export async function transcribe(_file: Blob, _filename = "audio.webm"): Promise<string> {
  throw new Error("Voice transcription is not part of Action Compiler");
}

// eslint-disable-next-line require-yield
export async function* speakStream(_text: string, _voice?: string): AsyncGenerator<Uint8Array> {
  throw new Error("Text to speech is not part of Action Compiler");
}
