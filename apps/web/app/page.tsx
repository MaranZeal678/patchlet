/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { Embed } from "@/components/landing/Embed";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Marquee } from "@/components/landing/Marquee";
import { Pipeline } from "@/components/landing/Pipeline";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SplitStory } from "@/components/landing/SplitStory";
import { appUrl } from "@/lib/env";

export default function LandingPage() {
  const snippet = `<script src="${appUrl()}/widget.js"\n        data-key="pk_your_project_key" async></script>`;

  return (
    <div className="min-h-screen text-ink antialiased selection:bg-accent/15">
      <SiteHeader />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <SplitStory />
      <Pipeline />
      <Embed snippet={snippet} />
      <SiteFooter />
    </div>
  );
}
