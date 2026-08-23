/** Reading a source again: a web page as it stands now, a note as it was written. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { sourceFromDocument } from "@/lib/ingest/request";
import { reingestSource } from "@/lib/ingest/run";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(
  _request: Request,
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
    const source = await sourceFromDocument(data as Parameters<typeof sourceFromDocument>[0]);
    const document = await reingestSource(project.id, id, source);
    return corsJson({ document });
  } catch (failure) {
    const message = failure instanceof Error ? failure.message : "That source could not be read again.";
    return corsJson({ error: message }, { status: 400 });
  }
}
