/** Accepts the user's offer to report a missing feature and starts the workflow. */
import { preflight, withCors } from "@/lib/cors";
import { serviceClient } from "@/lib/supabase";
import { emitTrace } from "@/lib/trace";
import { escalationEngine, mistralApiKey, workflowDeploymentName, workflowName } from "@/lib/env";
import type { EscalateRequest } from "@patchlet/shared";

export const runtime = "nodejs";
export const maxDuration = 60;

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as Partial<EscalateRequest>;
  if (!body.key || !body.messageId) {
    return withCors(Response.json({ error: "key and messageId are required" }, { status: 400 }));
  }

  const db = serviceClient();
  const { data: project } = await db
    .from("project")
    .select("id, repo_full_name, repo_default_branch, site_url")
    .eq("embed_key", body.key)
    .maybeSingle();
  if (!project) return withCors(Response.json({ error: "unknown key" }, { status: 403 }));

  const { data: message } = await db
    .from("message")
    .select("id, content, feature_request")
    .eq("id", body.messageId)
    .maybeSingle();
  const featureRequest = message?.feature_request as Record<string, unknown> | null;
  if (!featureRequest) {
    return withCors(Response.json({ error: "that message has no feature request" }, { status: 400 }));
  }

  // The report can come from a conversation that started before the widget had an id.
  if (body.conversationId && typeof body.visitorId === "string" && body.visitorId) {
    await db
      .from("conversation")
      .update({ visitor_id: body.visitorId.slice(0, 64) })
      .eq("id", body.conversationId)
      .is("visitor_id", null);
  }

  const engine = escalationEngine();
  const { data: escalation } = await db
    .from("escalation")
    .insert({
      project_id: project.id,
      conversation_id: body.conversationId ?? null,
      message_id: body.messageId,
      request: featureRequest,
      engine,
      status: "queued",
    })
    .select("id")
    .single();
  const escalationId = escalation?.id as string;

  await emitTrace({
    projectId: project.id as string,
    escalationId,
    conversationId: body.conversationId ?? null,
    kind: "decision",
    title: "The user asked for this to be reported",
    detail: featureRequest,
    source: "agent",
  });

  if (engine === "mistral") {
    try {
      const response = await fetch(
        `https://api.mistral.ai/v1/workflows/${encodeURIComponent(workflowName())}/execute`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${mistralApiKey()}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            deployment_name: workflowDeploymentName(),
            input: {
              escalation_id: escalationId,
              project_id: project.id,
              repo_full_name: project.repo_full_name,
              default_branch: project.repo_default_branch ?? "main",
              site_url: project.site_url,
              ...featureRequest,
            },
          }),
        },
      );
      if (!response.ok) throw new Error(`workflow execute returned ${response.status}`);
      const started = (await response.json()) as { execution_id?: string };
      await db
        .from("escalation")
        .update({ execution_id: started.execution_id ?? null, status: "filing" })
        .eq("id", escalationId);
    } catch (error) {
      // The local runner picks it up instead; the demo never dead-ends here.
      await db.from("escalation").update({ engine: "local" }).eq("id", escalationId);
      await emitTrace({
        projectId: project.id as string,
        escalationId,
        kind: "status",
        title: "Handed to the local runner",
        status: "failed",
        detail: { reason: (error as Error).message },
        source: "agent",
      });
    }
  }

  return withCors(Response.json({ escalationId, status: "queued" }));
}
