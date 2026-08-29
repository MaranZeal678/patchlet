/**
 * The trajectory store.
 *
 * Canonical schema lives in supabase/migrations/20260829_trajectory_step.sql;
 * this adapter keeps the same rows in newline-delimited JSON under
 * apps/web/.data so the whole pipeline runs on a hackathon table with no
 * database in reach. Everything is held in memory (it is one day of demos,
 * not one year of production) and appended to disk for restarts.
 */
import fs from "node:fs";
import path from "node:path";
import type {
  CompiledTool,
  DiscoveredWorkflow,
  EquivalenceProof,
  RaceState,
  SessionRecord,
  TrajectoryStep,
} from "@patchlet/shared";

const DATA_DIR = path.join(process.cwd(), ".data");

type Store = {
  steps: TrajectoryStep[];
  sessions: Map<string, SessionRecord>;
  workflows: DiscoveredWorkflow[];
  tools: CompiledTool[];
  proofs: EquivalenceProof[];
  races: Map<string, RaceState>;
  scatter: { sessionId: string; x: number; y: number; cluster: number }[] | null;
  loaded: boolean;
};

/** Next dev re-evaluates modules on edit; the store survives on globalThis. */
function store(): Store {
  const g = globalThis as { __acStore?: Store };
  if (!g.__acStore) {
    g.__acStore = {
      steps: [],
      sessions: new Map(),
      workflows: [],
      tools: [],
      proofs: [],
      races: new Map(),
      scatter: null,
      loaded: false,
    };
  }
  load(g.__acStore);
  return g.__acStore;
}

function fileOf(name: string): string {
  return path.join(DATA_DIR, name);
}

function load(s: Store): void {
  if (s.loaded) return;
  s.loaded = true;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(fileOf("trajectory_step.jsonl"))) {
      const lines = fs.readFileSync(fileOf("trajectory_step.jsonl"), "utf8").split("\n").filter(Boolean);
      s.steps = lines.map((line) => JSON.parse(line) as TrajectoryStep);
    }
    if (fs.existsSync(fileOf("sessions.json"))) {
      const rows = JSON.parse(fs.readFileSync(fileOf("sessions.json"), "utf8")) as SessionRecord[];
      s.sessions = new Map(rows.map((row) => [row.id, row]));
    }
    for (const [key, file] of [
      ["workflows", "workflows.json"],
      ["tools", "tools.json"],
      ["proofs", "proofs.json"],
    ] as const) {
      if (fs.existsSync(fileOf(file))) {
        (s[key] as unknown[]) = JSON.parse(fs.readFileSync(fileOf(file), "utf8")) as unknown[];
      }
    }
    if (fs.existsSync(fileOf("scatter.json"))) {
      s.scatter = JSON.parse(fs.readFileSync(fileOf("scatter.json"), "utf8"));
    }
  } catch (error) {
    console.error("trajectory store load failed:", error);
  }
}

let flushTimer: NodeJS.Timeout | null = null;

function flushSoon(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    const s = store();
    try {
      fs.writeFileSync(fileOf("sessions.json"), JSON.stringify([...s.sessions.values()], null, 1));
      fs.writeFileSync(fileOf("workflows.json"), JSON.stringify(s.workflows, null, 1));
      fs.writeFileSync(fileOf("tools.json"), JSON.stringify(s.tools, null, 1));
      fs.writeFileSync(fileOf("proofs.json"), JSON.stringify(s.proofs, null, 1));
      if (s.scatter) fs.writeFileSync(fileOf("scatter.json"), JSON.stringify(s.scatter));
    } catch (error) {
      console.error("trajectory store flush failed:", error);
    }
  }, 400);
}

/* ---- trajectory_step ---- */

export function insertStep(step: TrajectoryStep): void {
  const s = store();
  s.steps.push(step);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(fileOf("trajectory_step.jsonl"), JSON.stringify(step) + "\n");

  const session = s.sessions.get(step.sessionId);
  if (session) {
    session.steps += 1;
    session.lastAt = step.at;
  } else {
    s.sessions.set(step.sessionId, {
      id: step.sessionId,
      app: step.app,
      instance: step.instance,
      startedAt: step.at,
      lastAt: step.at,
      status: "active",
      steps: 1,
    });
  }
  flushSoon();
}

export function endSession(sessionId: string, status: "completed" | "abandoned"): void {
  const s = store();
  const session = s.sessions.get(sessionId);
  if (session && session.status === "active") {
    session.status = status;
    flushSoon();
  }
}

export function stepsOf(sessionId: string): TrajectoryStep[] {
  return store()
    .steps.filter((step) => step.sessionId === sessionId)
    .sort((a, b) => a.seq - b.seq);
}

export function allSessions(): SessionRecord[] {
  return [...store().sessions.values()].sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1));
}

export function stepCount(): number {
  return store().steps.length;
}

/* ---- discovery / compile / prove / race ---- */

export function saveWorkflows(workflows: DiscoveredWorkflow[]): void {
  store().workflows = workflows;
  flushSoon();
}

export function allWorkflows(): DiscoveredWorkflow[] {
  return store().workflows;
}

export function saveScatter(points: { sessionId: string; x: number; y: number; cluster: number }[]): void {
  store().scatter = points;
  flushSoon();
}

export function scatter(): { sessionId: string; x: number; y: number; cluster: number }[] | null {
  return store().scatter;
}

export function saveTool(tool: CompiledTool): void {
  const s = store();
  const index = s.tools.findIndex((existing) => existing.id === tool.id);
  if (index >= 0) s.tools[index] = tool;
  else s.tools.push(tool);
  flushSoon();
}

export function allTools(): CompiledTool[] {
  return store().tools;
}

export function toolById(id: string): CompiledTool | undefined {
  return store().tools.find((tool) => tool.id === id);
}

export function saveProof(proof: EquivalenceProof): void {
  store().proofs.push(proof);
  flushSoon();
}

export function allProofs(): EquivalenceProof[] {
  return store().proofs;
}

export function saveRace(race: RaceState): void {
  store().races.set(race.id, race);
}

export function raceById(id: string): RaceState | undefined {
  return store().races.get(id);
}

export function latestRace(): RaceState | undefined {
  const races = [...store().races.values()];
  return races.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
}

/** Wipes everything — the pristine-demo reset. */
export function resetAll(): void {
  const s = store();
  s.steps = [];
  s.sessions = new Map();
  s.workflows = [];
  s.tools = [];
  s.proofs = [];
  s.races = new Map();
  s.scatter = null;
  for (const file of ["trajectory_step.jsonl", "sessions.json", "workflows.json", "tools.json", "proofs.json", "scatter.json"]) {
    try {
      fs.rmSync(fileOf(file), { force: true });
    } catch {
      /* already gone */
    }
  }
}
