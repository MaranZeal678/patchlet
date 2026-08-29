import { NextResponse } from "next/server";
import { resetAll } from "@/lib/compiler/db";
import { targetOrigin } from "@/lib/compiler/target";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  resetAll();
  await fetch(`${targetOrigin()}/compiler/reset`, { method: "POST" }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
