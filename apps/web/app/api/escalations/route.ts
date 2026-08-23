/** Every reported feature request, newest first. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { loadEscalations } from "@/lib/console/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ escalations: [] });
  try {
    return corsJson({ escalations: await loadEscalations(project.id) });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
}
