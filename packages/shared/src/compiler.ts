/**
 * Action Compiler types and the compiled-tool validator.
 *
 * The validator is validatePlan's descendant, with the same politics: model
 * output is untrusted, and a compiled tool may only touch endpoints that real
 * user demonstrations actually exercised. One unknown endpoint rejects the
 * whole tool — we would rather ship nothing than ship an imagined API call.
 */
import type { PageContext } from "./types";

/** One user action the recorder observed. */
export type RecordedAction = {
  kind: "click" | "change";
  target: { id: string | null; role: string; name: string };
  value?: string | boolean;
};

/** One state–action–state triple: the demonstration atom. */
export type TrajectoryStep = {
  app: string;
  instance: string;
  sessionId: string;
  seq: number;
  at: string;
  url: string;
  action: RecordedAction;
  before: PageContext;
  after: PageContext;
};

export type SessionStatus = "active" | "completed" | "abandoned";

export type SessionRecord = {
  id: string;
  app: string;
  instance: string;
  startedAt: string;
  lastAt: string;
  status: SessionStatus;
  steps: number;
};

/** One diff a mutation made to one entity, as the target app logged it. */
export type EntityDiff = { entity: string; before: unknown; after: unknown };

export type ObservedEffect = {
  at: string;
  instance: string;
  sessionId: string | null;
  method: string;
  template: string;
  path: string;
  params: Record<string, string>;
  body: unknown;
  ok: boolean;
  error?: string;
  diffs: EntityDiff[];
};

export type WorkflowParam = {
  name: string;
  type: "string" | "number" | "boolean" | "string[]";
  description: string;
  /** Where the value lives in the observed API call: "param:order_id" or "body:items". */
  source: string;
  required: boolean;
};

export type DiscoveredWorkflow = {
  id: string;
  name: string;
  description: string;
  params: WorkflowParam[];
  /** Ordered mutation templates that define this cluster, e.g. ["POST /orders/{order_id}/refund"]. */
  signature: string[];
  /** Every endpoint template the cluster's sessions demonstrated — the compiler's allowlist. */
  endpoints: string[];
  observed: number;
  succeeded: number;
  successRate: number;
  medianSteps: number;
  sessionIds: string[];
  /** Successful sessions withheld from compilation, spent on the equivalence proof. */
  heldOutSessionIds: string[];
  /** The interface probe: did controls for this capability actually exist on the page? */
  probe: { ok: boolean; evidence: { name: string; role: string; seen: number }[] };
  createdAt: string;
};

export type ToolStrategy = "api" | "hybrid" | "macro";

export type ValidationCheck = { name: string; ok: boolean; detail: string };

export type CompiledTool = {
  id: string;
  workflowId: string;
  name: string;
  strategy: ToolStrategy;
  code: string;
  validation: { ok: boolean; checks: ValidationCheck[] };
  smoke: { ok: boolean; ms: number; error?: string } | null;
  status: "draft" | "validated" | "proven" | "rejected";
  runtime: string;
  createdAt: string;
};

export type ProofCase = {
  sessionId: string;
  params: Record<string, unknown>;
  match: boolean;
  note: string;
  humanTransition: string[];
  toolTransition: string[];
};

export type EquivalenceProof = {
  id: string;
  toolId: string;
  cases: ProofCase[];
  ok: boolean;
  createdAt: string;
};

export type RaceLane = {
  label: string;
  status: "idle" | "running" | "done" | "failed";
  actions: number;
  llmCalls: number;
  tokens: number;
  ms: number;
  success: boolean;
  steps: { n: number; detail: string }[];
  error?: string;
};

export type RaceState = {
  id: string;
  toolId: string;
  task: string;
  status: "running" | "done";
  lanes: { blind: RaceLane; compiled: RaceLane };
  tenor: TenorReport | null;
  createdAt: string;
};

/** The Tenor framing: business value delivered per unit of AI spent. */
export type TenorReport = {
  valueUsd: number;
  blind: { costUsd: number; fitness: number };
  compiled: { costUsd: number; fitness: number };
  multiple: number;
};

/* ------------------------------------------------------------------ */
/* Compiled-tool validation                                             */
/* ------------------------------------------------------------------ */

const FORBIDDEN = [
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /^\s*import\s/m,
  /\bfetch\s*\(/,
  /\bprocess\b/,
  /\bglobalThis\b/,
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
];

const MAX_LINES = 120;

/**
 * Checks generated tool source against the endpoints real demonstrations used.
 *
 * The contract for generated code:
 *   export async function run(api, params) { ... }
 * where `api.get(path)` reads and `api.call("METHOD /template/{x}", params, body)`
 * mutates. Every template string handed to api.call must be one the users
 * demonstrated; the runtime enforces the same list, so this is belt and braces.
 */
export function validateToolSource(
  code: string,
  allowedTemplates: readonly string[],
): { ok: boolean; checks: ValidationCheck[] } {
  const checks: ValidationCheck[] = [];
  const allowed = new Set(allowedTemplates);

  const lines = code.split("\n").length;
  checks.push({
    name: "size",
    ok: lines <= MAX_LINES,
    detail: `${lines} lines (limit ${MAX_LINES})`,
  });

  const banned = FORBIDDEN.filter((pattern) => pattern.test(code)).map((pattern) => String(pattern));
  checks.push({
    name: "sandbox",
    ok: banned.length === 0,
    detail: banned.length === 0 ? "no imports, no fetch, no process access" : `forbidden: ${banned.join(", ")}`,
  });

  checks.push({
    name: "entrypoint",
    ok: /export\s+async\s+function\s+run\s*\(\s*api\s*,\s*params\s*\)/.test(code),
    detail: "export async function run(api, params)",
  });

  const templates = [...code.matchAll(/api\.call\(\s*["'`]([^"'`]+)["'`]/g)].map((match) => match[1] as string);
  const unknown = templates.filter((template) => !allowed.has(template));
  checks.push({
    name: "endpoints",
    ok: templates.length > 0 && unknown.length === 0,
    detail:
      templates.length === 0
        ? "tool performs no demonstrated mutation"
        : unknown.length === 0
          ? `all mutations demonstrated by users: ${[...new Set(templates)].join(", ")}`
          : `never demonstrated by any user: ${unknown.join(", ")}`,
  });

  // api.call with a non-literal first argument would dodge the static check.
  const dynamicCall = /api\.call\(\s*[^"'`]/.test(code);
  checks.push({
    name: "static-endpoints",
    ok: !dynamicCall,
    detail: dynamicCall ? "api.call must take a literal endpoint template" : "every endpoint is a string literal",
  });

  return { ok: checks.every((check) => check.ok), checks };
}
