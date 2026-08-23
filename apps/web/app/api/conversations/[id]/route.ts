/** One conversation: every message in order with the evidence behind it. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { loadConversationDetail } from "@/lib/console/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ error: "No project has been seeded." }, { status: 404 });

  const { id } = await context.params;
  try {
    const conversation = await loadConversationDetail(project.id, id);
    if (!conversation) return corsJson({ error: "No such conversation." }, { status: 404 });
    return corsJson({ conversation });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
}
