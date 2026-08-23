import { NextResponse } from "next/server";
import { listModels } from "@/lib/mistral";
import { serviceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Can the schema be read at all. It says nothing about any particular project. */
async function checkDatabase(): Promise<boolean> {
  try {
    const { error } = await serviceClient()
      .from("project")
      .select("id", { count: "exact", head: true });
    return !error;
  } catch {
    return false;
  }
}

async function checkMistral(): Promise<boolean> {
  try {
    return await listModels();
  } catch {
    return false;
  }
}

/** Liveness for both dependencies. Returns 503 when either is down so a probe can act on it. */
export async function GET(): Promise<Response> {
  const [db, mistral] = await Promise.all([checkDatabase(), checkMistral()]);
  const ok = db && mistral;
  return NextResponse.json({ ok, db, mistral }, { status: ok ? 200 : 503 });
}
