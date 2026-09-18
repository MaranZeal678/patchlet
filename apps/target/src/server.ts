/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * Meridian Supply demo host.
 *
 *   /                        the admin SPA (with the Action Compiler recorder embedded)
 *   /api/shop/:instance/...  the app's real HTTP API — what the UI drives, what compiled tools call
 *   /compiler/...            debug surface for the Action Compiler: effects, sandboxes
 *
 * Instances: "live" for humans and seeded sessions; "sbx-*" sandboxes for
 * compile smoke tests, equivalence proofs, and the race.
 */
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shopRouter } from "./api.js";
import * as shop from "./store.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({ exposedHeaders: ["x-instance"] }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/shop/:instance", shopRouter());

/* ---- Action Compiler debug surface ---- */

app.get("/compiler/effects", (req, res) => {
  res.json({
    effects: shop.effects({
      sessionId: req.query.sessionId ? String(req.query.sessionId) : undefined,
      instance: req.query.instance ? String(req.query.instance) : undefined,
    }),
  });
});

app.post("/compiler/sandbox", (_req, res) => {
  res.json({ instance: shop.createSandbox() });
});

app.delete("/compiler/sandbox/:name", (req, res) => {
  shop.dropSandbox(req.params.name);
  res.json({ ok: true });
});

app.post("/compiler/reset", (_req, res) => {
  shop.resetLive();
  res.json({ ok: true });
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "meridian-target", apiBase: "/api/shop" }));

/* ---- Static: the SPA and the recorder bundle ---- */

const widgetDist = path.resolve(here, "../../../packages/widget/dist");
app.use("/widget", express.static(widgetDist));
app.use(express.static(path.resolve(here, "../public")));

const port = Number(process.env.TARGET_PORT ?? 5210);
app.listen(port, () => {
  console.log(`Meridian Supply admin  http://localhost:${port}`);
  console.log(`Shop API               http://localhost:${port}/api/shop/live/...`);
});
