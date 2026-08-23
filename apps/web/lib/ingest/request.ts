/** Turning what arrives at the API into a source ingestion understands. */
import { fileSource, textSource, urlSource } from "./sources";
import type { ParsedSource } from "./types";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** The three shapes `POST /api/documents` accepts: a file, an address, or a written note. */
export async function sourceFromRequest(request: Request): Promise<ParsedSource> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No file was attached.");
    return fileSource(file);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new Error("Send a file, a JSON body with a url, or a JSON body with a title and text.");
  }
  const fields = (body ?? {}) as Record<string, unknown>;

  if (asString(fields.url).trim() !== "") return urlSource(asString(fields.url));
  if (asString(fields.text).trim() !== "") {
    return textSource(asString(fields.title), asString(fields.text));
  }
  throw new Error("Send a file, a JSON body with a url, or a JSON body with a title and text.");
}

/**
 * The source a stored document can be built from again. An upload cannot: the file itself was
 * never kept, only what was read out of it.
 */
export async function sourceFromDocument(row: {
  title: string;
  source_kind: string;
  source_ref: string | null;
  source_text: string | null;
}): Promise<ParsedSource> {
  if (row.source_kind === "url" && row.source_ref) return urlSource(row.source_ref);
  if (row.source_kind === "text" && row.source_text) {
    return textSource(row.title, row.source_text);
  }
  throw new Error("Only web pages and written notes can be re-indexed. Add the file again instead.");
}
