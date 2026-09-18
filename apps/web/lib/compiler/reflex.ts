/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * Reflex (reflex.runloop.ai) — the laboratory.
 *
 * When RUNLOOP_API_KEY (an rfx_ Reflex key) is set, the compile stage gains a
 * third lineage: a real coding-agent session launched in an isolated Runloop
 * devbox through Reflex's API. The agent gets the same evidence pack the local
 * lineages get, writes the semantic action there, and returns it between
 * sentinels; validation, sandbox smoke-testing, and the equivalence proof
 * still happen against the running app locally — the devbox writes code, the
 * demonstrations judge it.
 *
 * Agent choice is whatever the organization has credentials for: Codex when
 * an OpenAI key is configured in Reflex, otherwise opencode on Runloop-provided
 * models (the hackathon default).
 */

const BASE = process.env.REFLEX_BASE_URL ?? "https://reflex.runloop.ai";
const ORG = process.env.REFLEX_ORG ?? "doing-something";

export function reflexAvailable(): boolean {
  return Boolean(process.env.RUNLOOP_API_KEY);
}

export function sessionUrl(agentId: string): string {
  return `${BASE}/orgs/${ORG}/agents/${agentId}`;
}

function headers(): Record<string, string> {
  const key = process.env.RUNLOOP_API_KEY;
  if (!key) throw new Error("RUNLOOP_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "x-organization-id": ORG,
    "Content-Type": "application/json",
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}/api${path}`, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Reflex ${path} -> ${response.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text) as T;
}

type AgentSupport = {
  agents: Record<
    string,
    { status: string; endpoints?: { id: string; availability?: { available?: boolean } }[] }
  >;
};

/** Codex when the org has OpenAI credentials in Reflex; otherwise opencode. */
export async function pickAgentType(): Promise<string | null> {
  const support = await api<AgentSupport>("/config/agent-model-support");
  const usable = (name: string): boolean => {
    const agent = support.agents[name];
    return Boolean(agent && agent.status === "available" && agent.endpoints?.some((e) => e.availability?.available));
  };
  if (usable("codex")) return "codex";
  if (usable("opencode")) return "opencode";
  return null;
}

type Agent = { id: string; status: string; agentType: string; turnState?: string; devboxId?: string };

export async function launchAgent(name: string, prompt: string, agentType: string): Promise<Agent> {
  const result = await api<{ agent?: Agent } & Agent>("/agents", {
    method: "POST",
    body: JSON.stringify({ agentType, name, prompt }),
  });
  return result.agent ?? result;
}

const TERMINAL = new Set(["completed", "needs_input", "stopped", "error", "terminated", "interrupted"]);

/**
 * Waits for the session's first turn to produce a module. Reflex sessions stay
 * "running" for follow-up prompts after a turn, so completion is: terminal
 * status, or the turn back at idle with a sentinel block in the stream.
 */
export async function awaitModule(id: string, timeoutMs = 420_000): Promise<{ status: string; code: string | null }> {
  const started = Date.now();
  for (;;) {
    const result = await api<{ agent?: Agent } & Agent>(`/agents/${id}`);
    const agent = result.agent ?? result;
    const settled = TERMINAL.has(agent.status);
    const idle = agent.status === "running" && agent.turnState === "idle" && Date.now() - started > 15_000;
    if (settled || idle) {
      const code = await harvestModule(id).catch(() => null);
      if (code || settled) return { status: agent.status, code };
    }
    if (Date.now() - started > timeoutMs) return { status: "timeout", code: await harvestModule(id).catch(() => null) };
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

const SENTINEL = /===MODULE START===([\s\S]*?)===MODULE END===/g;

/**
 * Reads the session's event stream and extracts the last sentinel block from
 * any event payload — shape-agnostic on purpose, since different agent types
 * emit their text under different event forms.
 */
type StreamEvent = {
  type?: string;
  sequence?: number;
  payload?: { update?: { sessionUpdate?: string; content?: { text?: string } } };
};

export async function harvestModule(id: string): Promise<string | null> {
  const stream = await api<unknown>(`/agents/${id}/stream`);
  const events: unknown[] = Array.isArray(stream)
    ? stream
    : ((stream as { events?: unknown[] }).events ?? [(stream as object)]);

  // Agent replies stream as agent_message_chunk updates, so the sentinel block
  // only exists once the chunks are stitched back together in sequence order.
  const chunks = (events as StreamEvent[])
    .filter((event) => event.payload?.update?.sessionUpdate === "agent_message_chunk")
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((event) => event.payload?.update?.content?.text ?? "")
    .join("");
  let assembled: string | null = null;
  for (const match of chunks.matchAll(SENTINEL)) {
    const block = match[1] ?? "";
    if (/export\s+async\s+function\s+run/.test(block)) assembled = block;
  }
  if (assembled) {
    return assembled.replace(/^```[a-z]*\n?/gm, "").replace(/```\s*$/gm, "").trim();
  }

  // Different agent types put their text in different places; walk every
  // string in every event and keep the last sentinel block seen. The prompt
  // itself echoes through the stream and contains the marker instructions, so
  // prompt-side events are skipped and a block only counts if it is a module.
  const PROMPT_EVENTS = new Set(["session/prompt", "user", "user_message_chunk", "query", "session/new"]);
  let found: string | null = null;
  const visit = (value: unknown): void => {
    if (typeof value === "string") {
      for (const match of value.matchAll(SENTINEL)) {
        const block = match[1] ?? "";
        if (/export\s+async\s+function\s+run/.test(block)) found = block;
      }
      // Some payloads are JSON-encoded strings containing the real message.
      if (value.startsWith("{") || value.startsWith("[")) {
        try {
          visit(JSON.parse(value));
        } catch {
          /* plain text */
        }
      }
      return;
    }
    if (Array.isArray(value)) for (const item of value) visit(item);
    else if (value && typeof value === "object") for (const item of Object.values(value)) visit(item);
  };
  for (const event of events) {
    const type = (event as { type?: string }).type ?? "";
    if (PROMPT_EVENTS.has(type)) continue;
    visit(event);
  }

  if (!found) return null;
  return (found as string).replace(/^```[a-z]*\n?/gm, "").replace(/```\s*$/gm, "").trim();
}

export async function stopAgent(id: string): Promise<void> {
  await api(`/agents/${id}/stop`, { method: "POST" }).catch(() => undefined);
}
