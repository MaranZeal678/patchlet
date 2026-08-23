import { NextResponse } from "next/server";
import { projectSlug } from "@/lib/env";
import { listModels } from "@/lib/mistral";
import { serviceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<boolean> {
  try {
    const { data, error } = await serviceClient()
      .from("project")
      .select("id")
      .eq("slug", projectSlug())
      .maybeSingle();
    return !error && data !== null;
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
