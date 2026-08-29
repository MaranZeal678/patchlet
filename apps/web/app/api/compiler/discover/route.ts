import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/discover";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(): Promise<Response> {
  try {
    const result = await runDiscovery();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
