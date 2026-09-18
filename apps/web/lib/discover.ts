/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * Discovery: trajectories in, named workflows out.
 *
 * Three moves, in the spirit of OS-Genesis's reverse task synthesis:
 *
 *  1. Cluster sessions by the effect they actually had — the ordered mutation
 *     templates the target app logged for that session. Embeddings of each
 *     session's action story confirm the grouping and give the console its
 *     converging scatter plot.
 *  2. One structured model call per cluster reads sampled state–action–state
 *     triples plus the observed API calls and infers what task the humans were
 *     doing: a name, a description, and a parameter schema bound to real
 *     fields of the demonstrated calls.
 *  3. An interface probe (patchlet's, repurposed) verifies the capability is
 *     real: every control the synthesis relies on must have been published as
 *     an affordance by the live page, in multiple sessions.
 *
 * Successful sessions are split: most inform synthesis, a held-out set is
 * reserved to prove compiled tools equivalent later.
 */
import type {
  DiscoveredWorkflow,
  ObservedEffect,
  SessionRecord,
  TrajectoryStep,
  WorkflowParam,
} from "@patchlet/shared";
import { allSessions, saveScatter, saveWorkflows, stepsOf } from "./compiler/db";
import { effectsOf } from "./compiler/target";
import { chatJson, chatModel, embed } from "./openai";

const HELD_OUT = 3;

type SessionView = {
  record: SessionRecord;
  steps: TrajectoryStep[];
  effects: ObservedEffect[];
  okTemplates: string[];
  story: string;
};

function storyOf(steps: TrajectoryStep[]): string {
  return steps
    .map((step) => {
      const value = step.action.value !== undefined ? ` = ${String(step.action.value).slice(0, 40)}` : "";
      return `${step.action.kind} "${step.action.target.name}"${value}`;
    })
    .join(" -> ");
}

/** Compresses a trajectory to what synthesis needs: page, action, what changed. */
function compressForModel(view: SessionView): string {
  const lines = view.steps.map((step) => {
    const value = step.action.value !== undefined ? ` value=${JSON.stringify(step.action.value)}` : "";
    return `  [${step.url}] ${step.action.kind} "${step.action.target.name}" (${step.action.target.role})${value}`;
  });
  const effects = view.effects
    .filter((effect) => effect.ok)
    .map((effect) => `  API EFFECT ${effect.template} params=${JSON.stringify(effect.params)} body=${JSON.stringify(effect.body)}`);
  return `SESSION ${view.record.id.slice(0, 8)} (${view.steps.length} steps)\n${lines.join("\n")}\n${effects.join("\n")}`;
}

/* ---- tiny PCA for the converge scatter ---- */

function pca2(vectors: number[][]): { x: number; y: number }[] {
  const n = vectors.length;
  if (n === 0) return [];
  const dim = vectors[0]!.length;
  const mean = new Array<number>(dim).fill(0);
  for (const vector of vectors) for (let i = 0; i < dim; i++) mean[i]! += vector[i]! / n;
  const centered = vectors.map((vector) => vector.map((value, i) => value - mean[i]!));

  const component = (exclude: number[] | null): number[] => {
    let axis = centered[0]!.map((_, i) => Math.sin(i + 1));
    for (let iter = 0; iter < 30; iter++) {
      const next = new Array<number>(dim).fill(0);
      for (const row of centered) {
        let dot = 0;
        for (let i = 0; i < dim; i++) dot += row[i]! * axis[i]!;
        for (let i = 0; i < dim; i++) next[i]! += dot * row[i]!;
      }
      if (exclude) {
        let dot = 0;
        for (let i = 0; i < dim; i++) dot += next[i]! * exclude[i]!;
        for (let i = 0; i < dim; i++) next[i]! -= dot * exclude[i]!;
      }
      const norm = Math.sqrt(next.reduce((sum, value) => sum + value * value, 0)) || 1;
      axis = next.map((value) => value / norm);
    }
    return axis;
  };

  const first = component(null);
  const second = component(first);
  return centered.map((row) => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < dim; i++) {
      x += row[i]! * first[i]!;
      y += row[i]! * second[i]!;
    }
    return { x, y };
  });
}

/* ---- synthesis schema ---- */

const SYNTHESIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["name", "description", "params"],
  properties: {
    name: {
      type: "string",
      description: "snake_case function name for this workflow, e.g. refund_order",
    },
    description: { type: "string", description: "One sentence: what job the humans were doing." },
    params: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "type", "description", "source", "required"],
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["string", "number", "boolean", "string[]"] },
          description: { type: "string" },
          source: {
            type: "string",
            description:
              'Where the value appears in the primary observed API call: "param:<path_param>" or "body:<field>".',
          },
          required: { type: "boolean" },
        },
      },
    },
  },
} as const;

type Synthesis = {
  name: string;
  description: string;
  params: WorkflowParam[];
};

/** A param the model claims must actually resolve against a demonstrated call. */
function paramResolves(param: WorkflowParam, effect: ObservedEffect): boolean {
  const [kind, field] = param.source.split(":", 2) as [string, string];
  if (kind === "param") return field in effect.params;
  if (kind === "body") {
    const body = (effect.body ?? {}) as Record<string, unknown>;
    return field in body;
  }
  return false;
}

/** The interface probe: the controls this cluster's sessions used, as the pages published them. */
function probeControls(views: SessionView[]): { ok: boolean; evidence: { name: string; role: string; seen: number }[] } {
  const seen = new Map<string, { name: string; role: string; seen: number }>();
  let unpublished = 0;
  for (const view of views) {
    for (const step of view.steps) {
      const published = step.action.target.id !== null &&
        step.before.affordances.some((affordance) => affordance.id === step.action.target.id);
      if (!published) unpublished += 1;
      const key = `${step.action.target.role}:${step.action.target.name}`;
      const entry = seen.get(key) ?? { name: step.action.target.name, role: step.action.target.role, seen: 0 };
      entry.seen += 1;
      seen.set(key, entry);
    }
  }
  const evidence = [...seen.values()].sort((a, b) => b.seen - a.seen).slice(0, 10);
  const total = views.reduce((sum, view) => sum + view.steps.length, 0);
  return { ok: total > 0 && unpublished / total < 0.05, evidence };
}

export type DiscoveryResult = {
  workflows: DiscoveredWorkflow[];
  sessionsAnalyzed: number;
  clusters: number;
};

export async function runDiscovery(): Promise<DiscoveryResult> {
  const ended = allSessions().filter((session) => session.status !== "active" && session.steps >= 2);

  const views: SessionView[] = [];
  for (const record of ended) {
    const steps = stepsOf(record.id);
    const effects = await effectsOf(record.id);
    const okTemplates = effects.filter((effect) => effect.ok).map((effect) => effect.template);
    views.push({ record, steps, effects, okTemplates, story: storyOf(steps) });
  }

  // 1. Cluster by the first successful mutation — the effect that names the job.
  const clusters = new Map<string, SessionView[]>();
  const abandoned: SessionView[] = [];
  for (const view of views) {
    const primary = view.okTemplates[0];
    if (!primary) {
      abandoned.push(view);
      continue;
    }
    const list = clusters.get(primary) ?? [];
    list.push(view);
    clusters.set(primary, list);
  }

  // 2. Embed every story once: scatter for the console, centroids for the abandoned.
  const vectors = await embed(views.map((view) => view.story));
  const vectorOf = new Map(views.map((view, index) => [view.record.id, vectors[index]!]));
  const coords = pca2(vectors);
  const clusterKeys = [...clusters.keys()];

  const centroid = (members: SessionView[]): number[] => {
    const dim = vectors[0]!.length;
    const sum = new Array<number>(dim).fill(0);
    for (const member of members) {
      const vector = vectorOf.get(member.record.id)!;
      for (let i = 0; i < dim; i++) sum[i]! += vector[i]!;
    }
    return sum.map((value) => value / members.length);
  };
  const centroids = clusterKeys.map((key) => centroid(clusters.get(key)!));

  const cosine = (a: number[], b: number[]): number => {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!;
      na += a[i]! * a[i]!;
      nb += b[i]! * b[i]!;
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  };

  // Abandoned sessions count against the workflow they most resemble.
  const abandonedOf = new Map<string, SessionView[]>();
  for (const view of abandoned) {
    const vector = vectorOf.get(view.record.id)!;
    let best = 0;
    let bestScore = -Infinity;
    centroids.forEach((center, index) => {
      const score = cosine(vector, center);
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    });
    if (clusterKeys.length > 0) {
      const key = clusterKeys[best]!;
      const list = abandonedOf.get(key) ?? [];
      list.push(view);
      abandonedOf.set(key, list);
    }
  }

  saveScatter(
    views.map((view, index) => {
      const primary = view.okTemplates[0];
      const clusterIndex = primary
        ? clusterKeys.indexOf(primary)
        : clusterKeys.indexOf([...abandonedOf.entries()].find(([, list]) => list.includes(view))?.[0] ?? "");
      return {
        sessionId: view.record.id,
        x: Number(coords[index]!.x.toFixed(4)),
        y: Number(coords[index]!.y.toFixed(4)),
        cluster: clusterIndex,
      };
    }),
  );

  // 3. Reverse task synthesis per cluster.
  const workflows: DiscoveredWorkflow[] = [];
  for (const [template, members] of clusters) {
    if (members.length < 3) continue; // not a pattern yet

    const sorted = [...members].sort((a, b) => (a.record.startedAt < b.record.startedAt ? -1 : 1));
    const heldOut = sorted.slice(-HELD_OUT);
    const training = sorted.slice(0, -HELD_OUT);
    const samples = training.filter((_, index) => index % Math.ceil(training.length / 4) === 0).slice(0, 4);

    const endpoints = [...new Set(members.flatMap((member) => member.okTemplates))];
    const sampleEffect = members.find((member) => member.effects.some((effect) => effect.ok && effect.template === template))!
      .effects.find((effect) => effect.ok && effect.template === template)!;

    const prompt = [
      `Below are ${members.length} recorded sessions (${samples.length} shown) of employees using an internal commerce admin.`,
      `Every session ended with the same API effect: ${template}.`,
      `Infer the task they were all performing — this is reverse task synthesis: actions in, intent out.`,
      `Name it as a callable function (snake_case), describe it, and derive its parameters.`,
      `Each parameter's "source" must point at a real field of the primary observed call: "param:<name>" for ${JSON.stringify(Object.keys(sampleEffect.params))}, "body:<name>" for ${JSON.stringify(Object.keys((sampleEffect.body ?? {}) as object))}.`,
      `Do not invent parameters that have no source field.`,
      ``,
      ...samples.map(compressForModel),
    ].join("\n");

    const synthesis = await chatJson<Synthesis>(
      chatModel(),
      [
        {
          role: "system",
          content:
            "You compile observed human behaviour into semantic actions for AI agents. Be precise; parameters must map to demonstrated API fields.",
        },
        { role: "user", content: prompt },
      ],
      SYNTHESIS_SCHEMA as unknown as Record<string, unknown>,
      { name: "workflow_synthesis" },
    );

    // Model output is untrusted: a parameter without a demonstrated source is dropped.
    const params = synthesis.params.filter((param) => paramResolves(param, sampleEffect));

    // ...and the demonstrations are the authority on the parameter surface: any
    // path or body field the humans actually used but the model failed to name
    // is added mechanically, so equivalence proofs can reproduce every field.
    const primaries = members
      .flatMap((member) => member.effects)
      .filter((effect) => effect.ok && effect.template === template);
    const covered = new Set(params.map((param) => param.source));
    const taken = new Set(params.map((param) => param.name));
    const residual = (source: string, name: string, values: unknown[]): void => {
      if (covered.has(source) || taken.has(name) || values.length === 0) return;
      const sample = values[0];
      const type = Array.isArray(sample) ? "string[]" : typeof sample === "boolean" ? "boolean" : typeof sample === "number" ? "number" : "string";
      params.push({
        name,
        type,
        description: `Observed field of ${template} (added from demonstrations).`,
        source,
        required: values.length === primaries.length,
      });
      covered.add(source);
      taken.add(name);
    };
    const pathKeys = new Set(primaries.flatMap((effect) => Object.keys(effect.params)));
    for (const key of pathKeys) {
      residual(`param:${key}`, key, primaries.map((effect) => effect.params[key]).filter((value) => value !== undefined));
    }
    const bodyKeys = new Set(primaries.flatMap((effect) => Object.keys((effect.body ?? {}) as object)));
    for (const key of bodyKeys) {
      residual(`body:${key}`, key, primaries.map((effect) => ((effect.body ?? {}) as Record<string, unknown>)[key]).filter((value) => value !== undefined));
    }

    const abandonedHere = abandonedOf.get(template) ?? [];
    const observed = members.length + abandonedHere.length;
    const stepCounts = members.map((member) => member.steps.length).sort((a, b) => a - b);
    const medianSteps = stepCounts[Math.floor(stepCounts.length / 2)] ?? 0;

    workflows.push({
      id: `wf-${synthesis.name}`,
      name: synthesis.name,
      description: synthesis.description,
      params,
      signature: [template],
      endpoints,
      observed,
      succeeded: members.length,
      successRate: Number((members.length / observed).toFixed(3)),
      medianSteps,
      sessionIds: training.map((member) => member.record.id),
      heldOutSessionIds: heldOut.map((member) => member.record.id),
      probe: probeControls(members),
      createdAt: new Date().toISOString(),
    });
  }

  workflows.sort((a, b) => b.observed - a.observed);
  saveWorkflows(workflows);
  return { workflows, sessionsAnalyzed: views.length, clusters: clusters.size };
}
