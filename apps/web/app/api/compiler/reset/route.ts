/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { NextResponse } from "next/server";
import { resetAll } from "@/lib/compiler/db";
import { targetOrigin } from "@/lib/compiler/target";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  resetAll();
  await fetch(`${targetOrigin()}/compiler/reset`, { method: "POST" }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
