/** The repositories Patchlet's GitHub token can reach, for the connect flow on /console/repository. */
import { corsJson, preflight } from "@/lib/cors";
import { listRepositories } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  try {
    const all = await listRepositories();
    const repositories = query
      ? all.filter(
          (repository) =>
            repository.fullName.toLowerCase().includes(query) ||
            (repository.description ?? "").toLowerCase().includes(query),
        )
      : all;
    return corsJson({ repositories });
  } catch (error) {
    return corsJson({ error: (error as Error).message }, { status: 502 });
  }
}
