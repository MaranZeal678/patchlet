/** Recent conversations with their messages, for the Activity page's left column. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { loadConversations } from "@/lib/console/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(request: Request): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ conversations: [] });

  const requested = Number(new URL(request.url).searchParams.get("limit") ?? "40");
  const limit = Number.isFinite(requested) ? requested : 40;

  try {
    return corsJson({ conversations: await loadConversations(project.id, limit) });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
}
