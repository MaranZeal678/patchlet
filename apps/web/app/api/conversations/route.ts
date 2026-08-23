/** Recent conversations with their outcome, for the Conversations and Activity pages. */
import { corsJson, preflight } from "@/lib/cors";
import { isConversationOutcome } from "@/lib/agent/outcome";
import { loadProject } from "@/lib/console/project";
import { loadConversationSummaries, loadOutcomeCounts } from "@/lib/console/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(request: Request): Promise<Response> {
  const project = await loadProject();
  if (!project) {
    return corsJson({
      conversations: [],
      counts: { all: 0, solved: 0, product_bug: 0, missing_feature: 0, unresolved: 0 },
    });
  }

  const params = new URL(request.url).searchParams;
  const requested = Number(params.get("limit") ?? "60");
  const limit = Number.isFinite(requested) ? requested : 60;
  const filter = params.get("outcome");
  if (filter && filter !== "all" && !isConversationOutcome(filter)) {
    return corsJson({ error: `Unknown outcome "${filter}"` }, { status: 400 });
  }
  const outcome = filter && isConversationOutcome(filter) ? filter : undefined;

  try {
    const [conversations, counts] = await Promise.all([
      loadConversationSummaries(project.id, { outcome, limit }),
      loadOutcomeCounts(project.id),
    ]);
    return corsJson({ conversations, counts });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
}
