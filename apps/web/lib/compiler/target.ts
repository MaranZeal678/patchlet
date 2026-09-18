/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * Client for the target application (the software whose users author its API).
 *
 * In this MVP the target is the Meridian Supply admin running locally. The
 * same client is what a compiled tool receives as `api`: reads are open,
 * mutations are restricted to endpoint templates real users demonstrated —
 * enforced here at runtime and by validateToolSource statically.
 */
import type { ObservedEffect } from "@patchlet/shared";

export function targetOrigin(): string {
  return process.env.TARGET_ORIGIN ?? "http://localhost:5210";
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `${init?.method ?? "GET"} ${url} -> ${response.status}`);
  return body;
}

export async function effectsOf(sessionId: string): Promise<ObservedEffect[]> {
  const data = await json<{ effects: ObservedEffect[] }>(
    `${targetOrigin()}/compiler/effects?sessionId=${encodeURIComponent(sessionId)}`,
  );
  return data.effects;
}

export async function effectsOfInstance(instance: string): Promise<ObservedEffect[]> {
  const data = await json<{ effects: ObservedEffect[] }>(
    `${targetOrigin()}/compiler/effects?instance=${encodeURIComponent(instance)}`,
  );
  return data.effects;
}

export async function createSandbox(): Promise<string> {
  const data = await json<{ instance: string }>(`${targetOrigin()}/compiler/sandbox`, { method: "POST" });
  return data.instance;
}

export async function dropSandbox(instance: string): Promise<void> {
  await json(`${targetOrigin()}/compiler/sandbox/${instance}`, { method: "DELETE" });
}

export async function targetHealthy(): Promise<boolean> {
  try {
    await json(`${targetOrigin()}/health`);
    return true;
  } catch {
    return false;
  }
}

/**
 * The target's API mount point, advertised by its /health endpoint — so the
 * compiler stays target-agnostic instead of assuming one app's URL shape.
 */
let cachedApiBase: { origin: string; base: string } | null = null;

async function apiBase(): Promise<string> {
  const origin = targetOrigin();
  if (cachedApiBase && cachedApiBase.origin === origin) return cachedApiBase.base;
  let base = "/api/shop";
  try {
    const health = await json<{ apiBase?: string }>(`${origin}/health`);
    if (typeof health.apiBase === "string" && health.apiBase.startsWith("/")) base = health.apiBase;
  } catch {
    /* offline target reports itself elsewhere */
  }
  cachedApiBase = { origin, base };
  return base;
}

export type ToolApi = {
  get: (path: string) => Promise<unknown>;
  call: (template: string, params: Record<string, unknown>, body?: unknown) => Promise<unknown>;
};

/**
 * The `api` handed to compiled tools, bound to one instance and one allowlist.
 * Fills "{param}" slots from `params`, so generated code never concatenates
 * paths — which is also what makes the static endpoint check possible.
 */
export function toolApi(instance: string, allowedTemplates: readonly string[], sessionId?: string): ToolApi {
  const allowed = new Set(allowedTemplates);
  const base = async () => `${targetOrigin()}${await apiBase()}/${instance}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionId) headers["X-Session-Id"] = sessionId;

  return {
    async get(path: string): Promise<unknown> {
      if (!path.startsWith("/")) throw new Error(`api.get path must start with /: ${path}`);
      return json(`${await base()}${path}`, { headers });
    },
    async call(template: string, params: Record<string, unknown>, body?: unknown): Promise<unknown> {
      if (!allowed.has(template)) {
        throw new Error(`Endpoint was never demonstrated by any user: ${template}`);
      }
      const [method, pathTemplate] = template.split(" ", 2) as [string, string];
      const path = pathTemplate.replace(/\{(\w+)\}/g, (_, name: string) => {
        const value = params[name];
        if (value === undefined || value === null) throw new Error(`Missing path parameter {${name}}`);
        return encodeURIComponent(String(value));
      });
      return json(`${await base()}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
  };
}
