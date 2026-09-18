#!/usr/bin/env node
/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * The app serves the widget from its own origin, so the build artefact is copied into the app's
 * public directory rather than published. Run as part of `npm run build` in this package.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(packageRoot, "dist", "patchlet.js");
const destination = join(packageRoot, "..", "..", "apps", "web", "public", "widget.js");

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
console.log(`copied ${source} -> ${destination}`);
