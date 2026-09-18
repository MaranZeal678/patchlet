/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * POST /api/observe — the recorder's firehose.
 *
 * Receives one state–action–state triple per user action from any page the
 * recorder is embedded in (cross-origin by design, like every widget-facing
 * route), or an end-of-session marker.
 */
import { corsJson, preflight } from "@/lib/cors";
import { endSession, insertStep } from "@/lib/compiler/db";
import type { TrajectoryStep } from "@patchlet/shared";

export const OPTIONS = preflight;

type EndPayload = { end: true; sessionId: string; status?: "completed" | "abandoned" };

export async function POST(request: Request): Promise<Response> {
  let body: TrajectoryStep | EndPayload;
  try {
    body = (await request.json()) as TrajectoryStep | EndPayload;
  } catch {
    return corsJson({ error: "body must be JSON" }, { status: 400 });
  }

  if ("end" in body && body.end) {
    if (typeof body.sessionId !== "string") return corsJson({ error: "sessionId required" }, { status: 400 });
    endSession(body.sessionId, body.status === "completed" ? "completed" : "abandoned");
    return corsJson({ ok: true });
  }

  const step = body as TrajectoryStep;
  if (
    typeof step.sessionId !== "string" ||
    typeof step.seq !== "number" ||
    !step.action ||
    !step.before ||
    !step.after
  ) {
    return corsJson({ error: "step requires sessionId, seq, action, before, after" }, { status: 400 });
  }
  insertStep(step);
  return corsJson({ ok: true });
}
