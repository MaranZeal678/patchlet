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
