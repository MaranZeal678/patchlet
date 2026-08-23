/**
 * Starting one run of the worker against a request group.
 *
 * A run is an `escalation` row plus, on the Mistral engine, a workflow execution. Its `mode` says
 * what it is for: open the issue and stop, draft the pull request, or only carry a new count and
 * quote to what is already on GitHub. The local engine needs no call at all - its runner claims
 * queued rows itself - which is also the fallback whenever the workflow will not start.
 */
import type { FeatureRequest, RequestGroup, RequestGroupStatus } from "@patchlet/shared";
import { escalationEngine, mistralApiKey, workflowDeploymentName, workflowName } from "../env";
import { serviceClient } from "../supabase";
import { emitTrace } from "../trace";

export type RunMode = "full" | "file_only" | "update";

/** Points the group at the run now carrying it, so a second full run cannot start beside it. */
export async function attachRun(
  groupId: string,
  escalationId: string,
  status: RequestGroupStatus,
): Promise<void> {
  await serviceClient()
    .from("feature_request_group")
    .update({ escalation_id: escalationId, status })
    .eq("id", groupId);
}

export type RunProject = {
  id: string;
  repoFullName: string;
  defaultBranch: string;
  siteUrl: string | null;
};

/** The number GitHub gave the pull request, read back off its own URL. */
function pullNumber(url: string | null): number {
  const match = /\/pull\/(\d+)/.exec(url ?? "");
  return match ? Number(match[1]) : 0;
}

/**
 * Inserts the run and hands it to the engine.
 *
 * Returns the escalation id of the run, which is also what the widget follows.
 */
export async function startRun(input: {
  project: RunProject;
  group: RequestGroup;
  request: FeatureRequest;
  mode: RunMode;
  conversationId?: string | null;
  messageId?: string | null;
}): Promise<string> {
  const db = serviceClient();
  const engine = escalationEngine();
  const { data, error } = await db
    .from("escalation")
    .insert({
      project_id: input.project.id,
      conversation_id: input.conversationId ?? null,
      message_id: input.messageId ?? null,
      group_id: input.group.id,
      mode: input.mode,
      request: input.request,
      engine,
      status: "queued",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "the run could not be recorded");
  const escalationId = String(data.id);

  // A run that carries the group forward owns it from here, so a second full run cannot start
  // while this one is still drafting.
  if (input.mode === "full") await attachRun(input.group.id, escalationId, "drafting");
  else if (input.mode === "file_only") await attachRun(input.group.id, escalationId, "observed");

  if (engine === "mistral") await execute(input, escalationId);
  return escalationId;
}

/** The workflow input. Everything the worker needs about the group travels with the run. */
function workflowInput(
  input: Parameters<typeof startRun>[0],
  escalationId: string,
): Record<string, unknown> {
  const { project, group, request, mode } = input;
  return {
    escalation_id: escalationId,
    // An update speaks into the trace of the run that owns the group, where a reader is looking.
    trace_escalation_id: group.escalationId ?? escalationId,
    project_id: project.id,
    repo_full_name: project.repoFullName,
    default_branch: project.defaultBranch,
    site_url: project.siteUrl ?? "",
    group_id: group.id,
    report_count: group.reportCount,
    user_report_count: group.userReportCount,
    priority: group.priority,
    issue_number: group.issueNumber ?? 0,
    pr_number: pullNumber(group.prUrl),
    file_only: mode === "file_only",
    update_only: mode === "update",
    ...request,
  };
}

async function execute(input: Parameters<typeof startRun>[0], escalationId: string): Promise<void> {
  const db = serviceClient();
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
          input: workflowInput(input, escalationId),
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
      projectId: input.project.id,
      escalationId,
      kind: "status",
      title: "Handed to the local runner",
      status: "failed",
      detail: { reason: (error as Error).message },
      source: "agent",
    });
  }
}
