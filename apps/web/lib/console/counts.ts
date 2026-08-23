import { serviceClient } from "@/lib/supabase";

export type ConsoleCounts = {
  documents: number;
  chunks: number;
  conversations: number;
  escalations: number;
};

async function countRows(table: string, projectId: string): Promise<number> {
  const { count } = await serviceClient()
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  return count ?? 0;
}

/** The four numbers the overview page shows. */
export async function loadCounts(projectId: string): Promise<ConsoleCounts> {
  const [documents, chunks, conversations, escalations] = await Promise.all([
    countRows("document", projectId),
    countRows("chunk", projectId),
    countRows("conversation", projectId),
    countRows("escalation", projectId),
  ]);
  return { documents, chunks, conversations, escalations };
}

/**
 * The worker writes a `status` trace event every minute. Anything inside two minutes counts as
 * online; anything older, or nothing at all, counts as offline.
 */
export async function loadWorkerHeartbeat(projectId: string): Promise<string | null> {
  const { data } = await serviceClient()
    .from("trace_event")
    .select("created_at")
    .eq("project_id", projectId)
    .eq("source", "workflow")
    .eq("kind", "status")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? String(data.created_at) : null;
}
