/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * Deterministic glue between demonstrations and compiled tools.
 *
 * Parameter extraction reads a workflow's parameter values out of a recorded
 * session's primary API effect (discovery already validated every param's
 * source against real fields). Transition normalization turns a mutation's
 * entity diffs into order-independent strings so two runs — one human, one
 * compiled — can be compared for equivalence.
 */
import type { DiscoveredWorkflow, EntityDiff, ObservedEffect } from "@patchlet/shared";

export function primaryEffect(workflow: DiscoveredWorkflow, effects: ObservedEffect[]): ObservedEffect | null {
  return effects.find((effect) => effect.ok && effect.template === workflow.signature[0]) ?? null;
}

export function extractParams(
  workflow: DiscoveredWorkflow,
  effect: ObservedEffect,
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const param of workflow.params) {
    const [kind, field] = param.source.split(":", 2) as [string, string];
    const value =
      kind === "param" ? effect.params[field] : ((effect.body ?? {}) as Record<string, unknown>)[field];
    if (value !== undefined) params[param.name] = value;
  }
  return params;
}

/** Keys that legitimately differ between two otherwise identical runs. */
const VOLATILE = /^(id|createdAt|at|orderId)$/;

function flatten(value: unknown, prefix: string, out: Map<string, string>): void {
  if (value === null || value === undefined) return;
  if (typeof value !== "object") {
    out.set(prefix, String(value));
    return;
  }
  if (Array.isArray(value)) {
    out.set(prefix, JSON.stringify(value));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (VOLATILE.test(key)) continue;
    flatten(child, prefix ? `${prefix}.${key}` : key, out);
  }
}

/**
 * One entity diff -> sorted "entity.field: before -> after" strings.
 * Message arrays get length-compared so a reply shows as messages: 1 -> 2.
 */
export function normalizeDiffs(diffs: EntityDiff[]): string[] {
  const lines: string[] = [];
  for (const diff of diffs) {
    const kind = diff.entity.split(":")[0]!;
    const before = new Map<string, string>();
    const after = new Map<string, string>();
    flatten(diff.before, "", before);
    flatten(diff.after, "", after);
    const keys = new Set([...before.keys(), ...after.keys()]);
    for (const key of keys) {
      const a = before.get(key);
      const b = after.get(key);
      if (a === b) continue;
      lines.push(`${kind}.${key}: ${a ?? "∅"} -> ${b ?? "∅"}`);
    }
  }
  return lines.sort();
}
