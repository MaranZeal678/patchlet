import { NextResponse } from "next/server";
import { allWorkflows, toolById } from "@/lib/compiler/db";
import { proveTool } from "@/lib/compiler/prove";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
  try {
    const { toolId } = (await request.json()) as { toolId: string };
    const tool = toolById(toolId);
    if (!tool) return NextResponse.json({ error: `no tool ${toolId}` }, { status: 404 });
    const workflow = allWorkflows().find((candidate) => candidate.id === tool.workflowId);
    if (!workflow) return NextResponse.json({ error: `no workflow for ${toolId}` }, { status: 404 });
    const proof = await proveTool(tool, workflow);
    return NextResponse.json({ proof });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
