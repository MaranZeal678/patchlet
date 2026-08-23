import { serviceClient } from "@/lib/supabase";

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

export type ConsoleMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export type ConsoleConversation = {
  id: string;
  pageUrl: string | null;
  pageTitle: string | null;
  createdAt: string;
  messages: ConsoleMessage[];
};

const ESCALATION_COLUMNS =
  "id, conversation_id, status, engine, request, issue_url, issue_number, pr_url, pr_number, branch, deployment_url, approval, error, created_at, updated_at";

/** Every reported feature request for the project, newest first. */
export async function loadEscalations(projectId: string): Promise<ConsoleEscalation[]> {
  const { data, error } = await serviceClient()
    .from("escalation")
    .select(ESCALATION_COLUMNS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
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
}

/** Recent conversations with their messages, newest conversation first. */
export async function loadConversations(
  projectId: string,
  limit: number,
): Promise<ConsoleConversation[]> {
  const db = serviceClient();
  const { data: rows, error } = await db
    .from("conversation")
    .select("id, page_url, page_title, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw new Error(error.message);

  const ids = (rows ?? []).map((row) => String(row.id));
  const byConversation = new Map<string, ConsoleMessage[]>();

  if (ids.length > 0) {
    const { data: messages } = await db
      .from("message")
      .select("id, conversation_id, role, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: true });
    for (const message of messages ?? []) {
      const key = String(message.conversation_id);
      const bucket = byConversation.get(key) ?? [];
      bucket.push({
        id: String(message.id),
        role: String(message.role),
        content: String(message.content),
        createdAt: String(message.created_at),
      });
      byConversation.set(key, bucket);
    }
  }

  return (rows ?? []).map((row) => ({
    id: String(row.id),
    pageUrl: row.page_url === null ? null : String(row.page_url),
    pageTitle: row.page_title === null ? null : String(row.page_title),
    createdAt: String(row.created_at),
    messages: byConversation.get(String(row.id)) ?? [],
  }));
}
