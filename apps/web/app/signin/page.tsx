/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign in - Patchlet",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const requested = params.next;
  // Only ever bounce back into the console, so the parameter cannot become an open redirect.
  const next =
    typeof requested === "string" && requested.startsWith("/console") ? requested : "/console";

  // The landing page's "Get started" arrives with mode=signup so the form opens on the tab
  // the visitor asked for rather than making them switch.
  const mode = params.mode === "signup" ? "signup" : "signin";

  return <AuthScreen next={next} initialMode={mode} />;
}
