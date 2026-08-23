/** Everything the agent can answer from, newest first. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export type ConsoleDocument = {
  id: string;
  title: string;
  sourceKind: string;
  sourceRef: string | null;
  mime: string | null;
  status: string;
  pageCount: number | null;
  meanConfidence: number | null;
  chunkCount: number;
  error: string | null;
  createdAt: string;
};

export async function GET(): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ documents: [] });

  const { data, error } = await serviceClient()
    .from("document")
    .select(
      "id, title, source_kind, source_ref, mime, status, page_count, mean_confidence, chunk_count, error, created_at",
    )
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  if (error) return corsJson({ error: error.message }, { status: 500 });

  const documents: ConsoleDocument[] = (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    sourceKind: String(row.source_kind),
    sourceRef: row.source_ref === null ? null : String(row.source_ref),
    mime: row.mime === null ? null : String(row.mime),
    status: String(row.status),
    pageCount: row.page_count === null ? null : Number(row.page_count),
    meanConfidence: row.mean_confidence === null ? null : Number(row.mean_confidence),
    chunkCount: Number(row.chunk_count ?? 0),
    error: row.error === null ? null : String(row.error),
    createdAt: String(row.created_at),
  }));

  return corsJson({ documents });
}
