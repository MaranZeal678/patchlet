/**
 * Puts the demo back to its starting position.
 *
 * This closes real issues and pull requests and deletes real rows, so it is the one console route
 * that insists on a signed-in account. The knowledge base is never touched.
 */
import { currentAccount } from "@/lib/auth/server";
import { loadProject } from "@/lib/console/project";
import { resetDemo } from "@/lib/demo/reset";
import { corsJson, preflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(): Promise<Response> {
  const account = await currentAccount();
  if (!account) return corsJson({ error: "Sign in first." }, { status: 401 });

  const project = await loadProject();
  if (!project) return corsJson({ error: "No project has been seeded yet." }, { status: 409 });

  try {
    const summary = await resetDemo({
      repo: project.repoFullName,
      githubToken: process.env.GITHUB_TOKEN ?? null,
      supabaseUrl: process.env.SUPABASE_URL ?? null,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
      projectId: project.id,
    });
    return corsJson({ summary });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 500 });
  }
}
