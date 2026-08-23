/** One source: what was read out of it, and removing it. */
import { corsJson, preflight } from "@/lib/cors";
import { DOCUMENT_COLUMNS, toConsoleDocument } from "@/lib/ingest/run";
import type { IngestPage } from "@/lib/ingest/types";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

/** The document with every page's extracted text, so the console can show what was read. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const { data, error } = await serviceClient()
    .from("document")
    .select(`${DOCUMENT_COLUMNS}, pages`)
    .eq("id", id)
    .maybeSingle();

  if (error) return corsJson({ error: error.message }, { status: 500 });
  if (!data) return corsJson({ error: "No such source." }, { status: 404 });

  const row = data as Record<string, unknown>;
  const pages = Array.isArray(row.pages) ? (row.pages as IngestPage[]) : [];
  return corsJson({ document: { ...toConsoleDocument(row), pages } });
}

/** Removing a source takes its chunks with it, so the agent stops answering from it at once. */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const { error } = await serviceClient().from("document").delete().eq("id", id);
  if (error) return corsJson({ error: error.message }, { status: 500 });
  return corsJson({ ok: true });
}
