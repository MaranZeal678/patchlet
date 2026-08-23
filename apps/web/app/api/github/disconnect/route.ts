/** Unlinks the GitHub account. The repository binding stays, so the agent keeps reading it. */
import { corsJson, preflight } from "@/lib/cors";
import { loadProject } from "@/lib/console/project";
import { clearConnection } from "@/lib/github/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(): Promise<Response> {
  const project = await loadProject();
  if (!project) return corsJson({ error: "no project has been seeded yet" }, { status: 404 });

  try {
    await clearConnection(project.id);
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
  return corsJson({ ok: true });
}
