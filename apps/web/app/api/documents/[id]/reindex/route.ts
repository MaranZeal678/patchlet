/**
 * Reading a source again: a web page as it stands now, a note as it was written, or a file
 * attached in place of one that was only ever read (an upload keeps its row and its history).
 */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { sourceFromDocument } from "@/lib/ingest/request";
import { reingestSource } from "@/lib/ingest/run";
import { fileSource } from "@/lib/ingest/sources";
import type { ParsedSource } from "@/lib/ingest/types";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export function OPTIONS(): Response {
  return preflight();
}

type StoredSource = Parameters<typeof sourceFromDocument>[0];

/** A replacement file when one was attached, otherwise whatever the row can be rebuilt from. */
async function sourceFor(request: Request, row: StoredSource): Promise<ParsedSource> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) return sourceFromDocument(row);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new Error("No file was attached.");
  // The row keeps the name it is known by; only its contents are replaced.
  return { ...(await fileSource(file)), title: row.title };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const project = await loadProject();
  if (!project) return corsJson({ error: "No project has been seeded yet." }, { status: 409 });

  const { data } = await serviceClient()
    .from("document")
    .select("id, title, source_kind, source_ref, source_text")
    .eq("id", id)
    .eq("project_id", project.id)
    .maybeSingle();
  if (!data) return corsJson({ error: "No such source." }, { status: 404 });

  try {
    const source = await sourceFor(request, data as StoredSource);
    const document = await reingestSource(project.id, id, source);
    return corsJson({ document });
  } catch (failure) {
    const message = failure instanceof Error ? failure.message : "That source could not be read again.";
    return corsJson({ error: message }, { status: 400 });
  }
}
