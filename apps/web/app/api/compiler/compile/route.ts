/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { NextResponse } from "next/server";
import { allWorkflows } from "@/lib/compiler/db";
import { compileWorkflow } from "@/lib/compiler/compile";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
  try {
    const { workflowId } = (await request.json()) as { workflowId: string };
    const workflow = allWorkflows().find((candidate) => candidate.id === workflowId);
    if (!workflow) return NextResponse.json({ error: `no workflow ${workflowId}` }, { status: 404 });
    const tools = await compileWorkflow(workflow);
    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
