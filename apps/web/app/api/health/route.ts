/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { NextResponse } from "next/server";
import { listModels } from "@/lib/openai";
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
