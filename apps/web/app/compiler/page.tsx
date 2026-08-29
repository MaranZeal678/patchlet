"use client";

/**
 * The Action Compiler console — the whole pitch on one page, top to bottom:
 * watch sessions converge, discover the workflow, compile it, prove it
 * equivalent, then race a blind UI agent against the compiled tool.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CompiledTool,
  DiscoveredWorkflow,
  EquivalenceProof,
  RaceState,
  SessionRecord,
} from "@patchlet/shared";

type Overview = {
  provider: string;
  target: { origin: string; healthy: boolean };
  sessions: SessionRecord[];
  stepCount: number;
  scatter: { sessionId: string; x: number; y: number; cluster: number }[] | null;
  workflows: DiscoveredWorkflow[];
  tools: CompiledTool[];
  proofs: EquivalenceProof[];
  race: RaceState | null;
};

const CLUSTER_COLORS = ["#34d399", "#a78bfa", "#f59e0b", "#38bdf8", "#f472b6"];

function hashUnit(value: string, salt: number): number {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

export default function CompilerConsole() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const raceRunning = overview?.race?.status === "running";
  const pollRef = useRef<number>(1500);
  pollRef.current = raceRunning ? 700 : 1500;

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/compiler/overview", { cache: "no-store" });
      setOverview((await response.json()) as Overview);
    } catch {
      /* next poll retries */
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const loop = async () => {
      while (alive) {
        await refresh();
        await new Promise((resolve) => setTimeout(resolve, pollRef.current));
      }
    };
    void loop();
    return () => {
      alive = false;
    };
  }, [refresh]);

  const act = useCallback(
    async (label: string, path: string, body?: unknown) => {
      setBusy(label);
      setError(null);
      try {
        const response = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? response.statusText);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(null);
        void refresh();
      }
    },
    [refresh],
  );

  const sessions = overview?.sessions ?? [];
  const ended = sessions.filter((session) => session.status !== "active");
  const completed = sessions.filter((session) => session.status === "completed");

  const scatterPoints = useMemo(() => {
    if (!overview) return [];
    const byId = new Map((overview.scatter ?? []).map((point) => [point.sessionId, point]));
    const xs = (overview.scatter ?? []).map((point) => point.x);
    const ys = (overview.scatter ?? []).map((point) => point.y);
    const spanX = Math.max(...xs, 0.001) - Math.min(...xs, -0.001);
    const spanY = Math.max(...ys, 0.001) - Math.min(...ys, -0.001);
    const minX = Math.min(...xs, -0.001);
    const minY = Math.min(...ys, -0.001);
    return sessions.map((session) => {
      const point = byId.get(session.id);
      if (point) {
        return {
          id: session.id,
          x: 30 + ((point.x - minX) / spanX) * 440,
          y: 24 + ((point.y - minY) / spanY) * 172,
          color: CLUSTER_COLORS[point.cluster % CLUSTER_COLORS.length] ?? "#71717a",
          discovered: true,
        };
      }
      return {
        id: session.id,
        x: 30 + hashUnit(session.id, 1) * 440,
        y: 24 + hashUnit(session.id, 2) * 172,
        color: "#52525b",
        discovered: false,
      };
    });
  }, [overview, sessions]);

  const toolsOf = (workflowId: string) => (overview?.tools ?? []).filter((tool) => tool.workflowId === workflowId);
  const proofOf = (toolId: string) =>
    (overview?.proofs ?? []).filter((proof) => proof.toolId === toolId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  const race = overview?.race ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 px-8 py-5 flex items-center gap-6 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <div>
          <div className="text-lg font-bold tracking-tight">
            ACTION<span className="text-emerald-400">COMPILER</span>
          </div>
          <div className="text-[11px] text-zinc-500">humans demonstrate · we compile · agents call</div>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-zinc-400">
          <span className={overview?.target.healthy ? "text-emerald-400" : "text-red-400"}>
            ● target app {overview?.target.healthy ? "connected" : "offline"}
          </span>
          <span>{overview?.provider ?? "…"}</span>
          <button
            className="border border-zinc-700 rounded px-3 py-1.5 hover:bg-zinc-800"
            onClick={() => act("reset", "/api/compiler/reset")}
          >
            reset demo
          </button>
        </div>
      </header>

      {error && <div className="mx-8 mt-4 rounded border border-red-800 bg-red-950/60 px-4 py-2 text-sm text-red-300">{error}</div>}

      <main className="px-8 py-8 max-w-6xl mx-auto space-y-12">
        {/* Act 1 — observation */}
        <section>
          <SectionTitle step="01" title="Watch" subtitle="Every user action, recorded as affordance-map → action → affordance-map. This is not telemetry — it is demonstration data." />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Stat value={String(sessions.length)} label="sessions observed" accent />
            <Stat value={String(overview?.stepCount ?? 0)} label="state–action–state triples" />
            <Stat value={String(completed.length)} label="reached their goal" />
          </div>
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-2">
              {overview?.scatter ? "sessions, embedded and clustered — one colour per discovered job" : "sessions, unclustered — run discovery to watch them converge"}
            </div>
            <svg viewBox="0 0 500 220" className="w-full">
              {scatterPoints.map((point) => (
                <circle
                  key={point.id}
                  r={point.discovered ? 4 : 3}
                  fill={point.color}
                  opacity={point.discovered ? 0.9 : 0.45}
                  style={{
                    transform: `translate(${point.x}px, ${point.y}px)`,
                    transition: "transform 1.4s cubic-bezier(.2,.8,.2,1), fill 1.4s",
                  }}
                />
              ))}
            </svg>
          </div>
        </section>

        {/* Act 2 — discovery */}
        <section>
          <SectionTitle
            step="02"
            title="Discover"
            subtitle="Cluster trajectories by the effect they had, then reverse task synthesis: actions in, intent out."
          />
          <button
            className="mt-4 rounded bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
            disabled={busy !== null || ended.length < 10}
            onClick={() => act("discover", "/api/compiler/discover")}
          >
            {busy === "discover" ? "compiling observations…" : `Run discovery on ${ended.length} sessions`}
          </button>

          <div className="mt-5 grid gap-5">
            {(overview?.workflows ?? []).map((workflow) => {
              const tools = toolsOf(workflow.id);
              const best = tools.find((tool) => tool.status === "proven") ?? tools.find((tool) => tool.status === "validated");
              return (
                <div key={workflow.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <code className="text-emerald-300 text-base font-semibold">
                      {workflow.name}({workflow.params.map((param) => param.name).join(", ")})
                    </code>
                    <span className="text-xs text-zinc-500">{workflow.signature[0]}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{workflow.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Chip>observed {workflow.observed}×</Chip>
                    <Chip>{Math.round(workflow.successRate * 100)}% human success</Chip>
                    <Chip>median {workflow.medianSteps} human steps</Chip>
                    <Chip tone={workflow.probe.ok ? "good" : "bad"}>
                      interface probe: {workflow.probe.ok ? "controls verified on page" : "unverified"}
                    </Chip>
                    <Chip>{workflow.heldOutSessionIds.length} sessions held out for proof</Chip>
                  </div>
                  <div className="mt-3 text-xs text-zinc-500">
                    evidence: {workflow.probe.evidence.slice(0, 5).map((entry) => `${entry.name} ×${entry.seen}`).join(" · ")}
                  </div>

                  {/* Act 3 — compile */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      className="rounded bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-violet-400 disabled:opacity-40"
                      disabled={busy !== null}
                      onClick={() => act(`compile-${workflow.id}`, "/api/compiler/compile", { workflowId: workflow.id })}
                    >
                      {busy === `compile-${workflow.id}` ? "two lineages compiling…" : tools.length ? "Recompile" : "Compile"}
                    </button>
                    {best && (
                      <>
                        <button
                          className="rounded border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-950 disabled:opacity-40"
                          disabled={busy !== null}
                          onClick={() => act(`prove-${best.id}`, "/api/compiler/prove", { toolId: best.id })}
                        >
                          {busy === `prove-${best.id}` ? "replaying held-out humans…" : "Prove equivalence"}
                        </button>
                        <button
                          className="rounded border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-950 disabled:opacity-40"
                          disabled={busy !== null || raceRunning}
                          onClick={() => act(`race-${best.id}`, "/api/compiler/race", { toolId: best.id })}
                        >
                          Race it
                        </button>
                      </>
                    )}
                  </div>

                  {tools.length > 0 && (
                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                      {tools.map((tool) => {
                        const proof = proofOf(tool.id);
                        return (
                          <div key={tool.id} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-zinc-200">lineage · {tool.strategy}</span>
                              <StatusBadge status={tool.status} />
                              <span className="ml-auto text-[11px] text-zinc-500">{tool.runtime}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                              <span>{tool.sandbox ?? "local sandbox"}</span>
                              {tool.sessionUrl && (
                                <a href={tool.sessionUrl} target="_blank" rel="noreferrer" className="text-emerald-400 underline decoration-emerald-800 hover:text-emerald-300">
                                  view session in Reflex ↗
                                </a>
                              )}
                            </div>
                            <ul className="mt-2 space-y-1 text-xs">
                              {tool.validation.checks.map((check) => (
                                <li key={check.name} className={check.ok ? "text-emerald-400" : "text-red-400"}>
                                  {check.ok ? "✓" : "✕"} {check.name} — <span className="text-zinc-500">{check.detail}</span>
                                </li>
                              ))}
                              {tool.smoke && (
                                <li className={tool.smoke.ok ? "text-emerald-400" : "text-red-400"}>
                                  {tool.smoke.ok ? "✓" : "✕"} sandbox smoke test — <span className="text-zinc-500">{tool.smoke.ok ? `effect reproduced in ${tool.smoke.ms}ms` : tool.smoke.error}</span>
                                </li>
                              )}
                              {proof && (
                                <li className={proof.ok ? "text-emerald-400" : "text-red-400"}>
                                  {proof.ok ? "✓" : "✕"} equivalence — {proof.cases.filter((c) => c.match).length}/{proof.cases.length} held-out human sessions reproduced exactly
                                </li>
                              )}
                            </ul>
                            <button
                              className="mt-2 text-xs text-zinc-400 underline decoration-zinc-700 hover:text-zinc-200"
                              onClick={() => setOpenCode(openCode === tool.id ? null : tool.id)}
                            >
                              {openCode === tool.id ? "hide source" : "show compiled source"}
                            </button>
                            {openCode === tool.id && (
                              <pre className="mt-2 max-h-64 overflow-auto rounded bg-black/60 p-3 text-[11px] leading-relaxed text-zinc-300">
                                {tool.code}
                              </pre>
                            )}
                            {proof && !proof.ok && (
                              <div className="mt-2 text-[11px] text-red-400">
                                {proof.cases.filter((c) => !c.match).slice(0, 2).map((c) => c.note).join(" · ")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Act 5 — the race */}
        {race && (
          <section>
            <SectionTitle step="03" title="Race" subtitle={race.task} />
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {(["blind", "compiled"] as const).map((key) => {
                const lane = race.lanes[key];
                const done = lane.status === "done";
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-5 ${key === "compiled" ? "border-violet-700 bg-violet-950/20" : "border-zinc-800 bg-zinc-900/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{key === "blind" ? "👁 Blind UI agent" : "⚡ Compiled semantic action"}</span>
                      <span className="text-xs text-zinc-500">{lane.label}</span>
                      {done && race.status === "done" && (
                        <span className={`ml-auto text-xs font-bold ${lane.success ? "text-emerald-400" : "text-red-400"}`}>
                          {lane.success ? "✓ verified in app state" : "✕ not verified"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                      <Stat small value={String(lane.actions)} label="actions" />
                      <Stat small value={String(lane.llmCalls)} label="LLM calls" />
                      <Stat small value={lane.tokens.toLocaleString()} label="tokens" />
                      <Stat small value={`${(lane.ms / 1000).toFixed(1)}s`} label="wall time" />
                    </div>
                    <div className="mt-3 h-40 overflow-auto rounded bg-black/40 p-2 text-[11px] leading-relaxed text-zinc-400">
                      {lane.steps.slice(-14).map((step) => (
                        <div key={step.n + step.detail}>
                          <span className="text-zinc-600">{String(step.n).padStart(2, "0")}</span> {step.detail}
                        </div>
                      ))}
                      {lane.status === "running" && <div className="text-amber-300 animate-pulse">…</div>}
                      {lane.error && <div className="text-red-400">{lane.error}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {race.status === "done" && race.tenor && (
              <div className="mt-4 rounded-xl border border-emerald-800 bg-emerald-950/20 p-5">
                <div className="text-xs uppercase tracking-widest text-emerald-500">Tenor · economic outcome</div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat value={`${race.lanes.blind.actions} → ${race.lanes.compiled.actions}`} label="UI actions → semantic actions" />
                  <Stat value={`${(race.lanes.blind.ms / 1000).toFixed(1)}s → ${(race.lanes.compiled.ms / 1000).toFixed(1)}s`} label="wall time" />
                  <Stat value={`${race.lanes.blind.tokens.toLocaleString()} → ${race.lanes.compiled.tokens.toLocaleString()}`} label="tokens" />
                  <Stat value={`${race.tenor.multiple}×`} label="value per token multiple" accent />
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  case value ${race.tenor.valueUsd.toFixed(2)} · blind cost ${race.tenor.blind.costUsd.toFixed(3)} (fitness{" "}
                  {race.tenor.blind.fitness}) · compiled cost ${race.tenor.compiled.costUsd.toFixed(3)} (fitness {race.tenor.compiled.fitness}) —
                  token prices modeled at GPT-5 list rates
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="border-t border-zinc-900 pt-6 pb-16 text-xs text-zinc-600 leading-relaxed">
          Built on Patchlet&apos;s affordance scanner: the recorder publishes the same structured page state the widget used for guidance.
          PostHog-shaped session capture · compiled in parallel lineages, Reflex-style isolated sandboxes · outcomes priced the Tenor way ·
          every compiled tool is proven equivalent to held-out human demonstrations before it ships.
        </footer>
      </main>
    </div>
  );
}

function SectionTitle({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-mono text-emerald-500">{step}</span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-500 max-w-3xl">{subtitle}</p>
    </div>
  );
}

function Stat({ value, label, accent, small }: { value: string; label: string; accent?: boolean; small?: boolean }) {
  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900/60 ${small ? "p-2" : "p-4"}`}>
      <div className={`font-bold ${small ? "text-sm" : "text-2xl"} ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{value}</div>
      <div className={`text-zinc-500 ${small ? "text-[10px]" : "text-xs"}`}>{label}</div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "good" | "bad" }) {
  const color =
    tone === "good" ? "border-emerald-700 text-emerald-300" : tone === "bad" ? "border-red-700 text-red-300" : "border-zinc-700 text-zinc-300";
  return <span className={`rounded-full border px-2.5 py-1 ${color}`}>{children}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    proven: "bg-emerald-500/20 text-emerald-300 border-emerald-700",
    validated: "bg-sky-500/20 text-sky-300 border-sky-700",
    rejected: "bg-red-500/20 text-red-300 border-red-700",
    draft: "bg-zinc-500/20 text-zinc-300 border-zinc-700",
  };
  return <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide ${map[status] ?? map.draft}`}>{status}</span>;
}
