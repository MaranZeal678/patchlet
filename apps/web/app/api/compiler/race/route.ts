import { NextResponse } from "next/server";
import { allWorkflows, toolById } from "@/lib/compiler/db";
import { raceState, startRace } from "@/lib/compiler/race";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
  try {
    const { toolId } = (await request.json()) as { toolId: string };
    const tool = toolById(toolId);
    if (!tool) return NextResponse.json({ error: `no tool ${toolId}` }, { status: 404 });
    const workflow = allWorkflows().find((candidate) => candidate.id === tool.workflowId);
    if (!workflow) return NextResponse.json({ error: `no workflow for ${toolId}` }, { status: 404 });
    const raceId = await startRace(tool, workflow);
    return NextResponse.json({ raceId });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const race = raceState(id);
  if (!race) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ race });
}
