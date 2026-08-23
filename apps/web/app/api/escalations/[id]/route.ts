/** The widget polls this to show what happened to a reported request. */
import { preflight, withCors } from "@/lib/cors";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export function OPTIONS(): Response {
  return preflight();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const { data } = await serviceClient()
    .from("escalation")
    .select("id, status, issue_url, pr_url, deployment_url, request, approval, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return withCors(Response.json({ error: "not found" }, { status: 404 }));
  return withCors(
    Response.json({
      id: data.id,
      status: data.status,
      issueUrl: data.issue_url,
      prUrl: data.pr_url,
      deploymentUrl: data.deployment_url,
      request: data.request,
      approval: data.approval,
      createdAt: data.created_at,
    }),
  );
}
