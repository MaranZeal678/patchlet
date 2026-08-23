/** The last things the worker opened on GitHub, for the bell in the console bar. */
import { corsJson, preflight } from "@/lib/cors";
import { loadNotifications } from "@/lib/console/notifications";
import { loadProject } from "@/lib/console/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ notifications: [] });

  try {
    return corsJson({ notifications: await loadNotifications(project.id) });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
}
