/** Every reported feature request, newest first. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export type ConsoleEscalation = {
  id: string;
  conversationId: string | null;
  status: string;
  engine: string;
  request: { title?: string; description?: string; area?: string; quote?: string } | null;
  issueUrl: string | null;
  issueNumber: number | null;
  prUrl: string | null;
  prNumber: number | null;
  branch: string | null;
  deploymentUrl: string | null;
  approval: { approved?: boolean; note?: string; decidedAt?: string } | null;
  error: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export async function GET(): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ escalations: [] });

  const { data, error } = await serviceClient()
    .from("escalation")
    .select(
      "id, conversation_id, status, engine, request, issue_url, issue_number, pr_url, pr_number, branch, deployment_url, approval, error, created_at, updated_at",
    )
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) return corsJson({ error: error.message }, { status: 500 });

  const escalations: ConsoleEscalation[] = (data ?? []).map((row) => ({
    id: String(row.id),
    conversationId: row.conversation_id === null ? null : String(row.conversation_id),
    status: String(row.status),
    engine: String(row.engine),
    request: (row.request ?? null) as ConsoleEscalation["request"],
    issueUrl: row.issue_url === null ? null : String(row.issue_url),
    issueNumber: row.issue_number === null ? null : Number(row.issue_number),
    prUrl: row.pr_url === null ? null : String(row.pr_url),
    prNumber: row.pr_number === null ? null : Number(row.pr_number),
    branch: row.branch === null ? null : String(row.branch),
    deploymentUrl: row.deployment_url === null ? null : String(row.deployment_url),
    approval: (row.approval ?? null) as ConsoleEscalation["approval"],
    error: row.error === null ? null : String(row.error),
    createdAt: String(row.created_at),
    updatedAt: row.updated_at === null ? null : String(row.updated_at),
  }));

  return corsJson({ escalations });
}
