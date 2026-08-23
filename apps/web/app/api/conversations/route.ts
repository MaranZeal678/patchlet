/** Recent conversations with their messages, for the Activity page's left column. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

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

export async function GET(request: Request): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ conversations: [] });

  const limitParam = Number(new URL(request.url).searchParams.get("limit") ?? "40");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 40;

  const db = serviceClient();
  const { data: rows, error } = await db
    .from("conversation")
    .select("id, page_url, page_title, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return corsJson({ error: error.message }, { status: 500 });

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

  const conversations: ConsoleConversation[] = (rows ?? []).map((row) => ({
    id: String(row.id),
    pageUrl: row.page_url === null ? null : String(row.page_url),
    pageTitle: row.page_title === null ? null : String(row.page_title),
    createdAt: String(row.created_at),
    messages: byConversation.get(String(row.id)) ?? [],
  }));

  return corsJson({ conversations });
}
