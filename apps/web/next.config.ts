/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shared package ships TypeScript source rather than a build artefact, so Next has to
  // compile it along with the app.
  transpilePackages: ["@patchlet/shared"],
};

export default nextConfig;
