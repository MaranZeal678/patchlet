/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { NextResponse } from "next/server";
import { allProofs, allSessions, allTools, allWorkflows, latestRace, scatter, stepCount } from "@/lib/compiler/db";
import { targetHealthy, targetOrigin } from "@/lib/compiler/target";
import { providerLabel } from "@/lib/openai";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return NextResponse.json({
    provider: providerLabel(),
    target: { origin: targetOrigin(), healthy: await targetHealthy() },
    sessions: allSessions(),
    stepCount: stepCount(),
    scatter: scatter(),
    workflows: allWorkflows(),
    tools: allTools(),
    proofs: allProofs(),
    race: latestRace() ?? null,
  });
}
