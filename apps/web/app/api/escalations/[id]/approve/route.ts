/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * The developer's decision on a drafted pull request.
 *
 * With the hosted engine the workflow is parked on `wait_for_input`, so the
 * decision is submitted as a workflow update. With the local runner the row
 * itself is the channel.
 */
import { preflight, withCors } from "@/lib/cors";
import { asErrorResponse, currentProject } from "@/lib/console/current";
import { serviceClient } from "@/lib/supabase";
import { emitTrace } from "@/lib/trace";
import { mistralApiKey } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

export function OPTIONS(): Response {
  return preflight();
}

type PendingInputs = {
  result?: { pending_inputs?: { task_id: string; label?: string }[] };
};

/** The pause appears a moment after the pull request opens, so give it a chance. */
async function pendingTaskId(executionId: string, key: string): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await fetch(
      `https://api.mistral.ai/v1/workflows/executions/${executionId}/queries`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ name: "__get_pending_inputs" }),
      },
    );
    if (response.ok) {
      const body = (await response.json()) as PendingInputs;
      const taskId = body.result?.pending_inputs?.[0]?.task_id;
      if (taskId) return taskId;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const project = await currentProject().catch(asErrorResponse);
  if (project instanceof Response) return project;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { approved?: boolean; note?: string };
  if (typeof body.approved !== "boolean") {
    return withCors(Response.json({ error: "approved is required" }, { status: 400 }));
  }
  const note = typeof body.note === "string" ? body.note : "";

  const db = serviceClient();
  const { data: escalation } = await db
    .from("escalation")
    .select("id, project_id, engine, execution_id, status")
    .eq("id", id)
    .eq("project_id", project.id)
    .maybeSingle();
  if (!escalation) return withCors(Response.json({ error: "not found" }, { status: 404 }));

  const approval = { approved: body.approved, note, decidedAt: new Date().toISOString() };
  await db
    .from("escalation")
    .update({ approval, status: body.approved ? "approved" : "rejected" })
    .eq("id", id);

  await emitTrace({
    projectId: escalation.project_id as string,
    escalationId: id,
    kind: "decision",
    title: body.approved ? "A developer approved the change" : "A developer rejected the change",
    detail: approval,
    source: "agent",
  });

  if (escalation.engine === "mistral" && escalation.execution_id) {
    const key = mistralApiKey();
    const taskId = await pendingTaskId(escalation.execution_id as string, key);
    if (!taskId) {
      return withCors(
        Response.json({ error: "the workflow is not waiting for a decision yet" }, { status: 409 }),
      );
    }
    const response = await fetch(
      `https://api.mistral.ai/v1/workflows/executions/${escalation.execution_id}/updates`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          name: "__submit_input",
          input: { task_id: taskId, input: { approved: body.approved, note } },
        }),
      },
    );
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return withCors(
        Response.json({ error: `could not submit the decision: ${detail.slice(0, 200)}` }, { status: 502 }),
      );
    }
  }

  return withCors(Response.json({ ok: true, status: body.approved ? "approved" : "rejected" }));
}
