/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

let cached: SupabaseClient | null = null;

/**
 * The service role client. It bypasses row level security, so it must never be constructed in
 * code that reaches the browser. The client is cached per server instance because creating one
 * per request leaks sockets under load.
 */
export function serviceClient(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
