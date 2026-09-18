/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * The race: same task, two sandboxes, two agents.
 *
 * Lane one is a blind UI agent — it perceives the app only as affordance maps
 * and clicks through, one model call per action, the way computer-use agents
 * work today. Lane two is the same model given the compiled semantic action.
 * Both are verified against the app's actual state afterwards; nothing is
 * scripted. The Tenor card prices the difference: business value per unit of
 * AI spent.
 */
import type { CompiledTool, DiscoveredWorkflow, PageContext, RaceLane, RaceState, TenorReport } from "@patchlet/shared";
import { raceById, saveRace } from "./db";
import { extractParams, primaryEffect } from "./extract";
import { createSandbox, dropSandbox, effectsOf, effectsOfInstance, toolApi } from "./target";
import { openHeadless } from "./headless";
import { importTool } from "./compile";
import { chatJsonUsage, chatModel, chatToolsUsage, type ChatMessage } from "../openai";

const MAX_BLIND_ACTIONS = 22;

/** Modeled GPT-5-class list prices; shown as an assumption, not a measurement. */
const USD_PER_PROMPT_TOKEN = 1.25 / 1_000_000;
const USD_PER_COMPLETION_TOKEN = 10 / 1_000_000;
/** Modeled value of one support case handled without a human. */
const CASE_VALUE_USD = 9.4;

function laneCost(lane: RaceLane, promptShare = 0.85): number {
  const prompt = lane.tokens * promptShare;
  const completion = lane.tokens * (1 - promptShare);
  return prompt * USD_PER_PROMPT_TOKEN + completion * USD_PER_COMPLETION_TOKEN;
}

function fitness(success: boolean, costUsd: number): number {
  return Math.round(100 * (success ? 1 : 0.1) * (CASE_VALUE_USD / (CASE_VALUE_USD + costUsd * 50)));
}

function describeAffordances(page: PageContext): string {
  return page.affordances
    .filter((affordance) => affordance.visible && !affordance.disabled)
    .map((affordance) => {
      const bits = [
        `${affordance.id} [${affordance.role}] "${affordance.name}"`,
        affordance.landmark ? `in ${affordance.landmark}` : "",
        affordance.state ? `(${affordance.state})` : "",
      ].filter(Boolean);
      return "  " + bits.join(" ");
    })
    .join("\n");
}

const BLIND_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["thought", "action", "target_id", "value"],
  properties: {
    thought: { type: "string", description: "One short sentence of reasoning." },
    action: { type: "string", enum: ["click", "set_value", "done", "give_up"] },
    target_id: { type: "string", description: "Affordance id to act on; empty for done/give_up." },
    value: {
      type: "string",
      description: "For set_value: the text, option, or 'true'/'false' for checkboxes. Empty otherwise.",
    },
  },
} as const;

type BlindDecision = { thought: string; action: "click" | "set_value" | "done" | "give_up"; target_id: string; value: string };

async function runBlindLane(race: RaceState, task: string, instance: string): Promise<void> {
  const lane = race.lanes.blind;
  lane.status = "running";
  saveRace(race);
  const started = Date.now();
  const browser = await openHeadless(instance);
  const history: string[] = [];

  try {
    for (let step = 0; step < MAX_BLIND_ACTIONS; step++) {
      const page = browser.scan();
      const prompt = [
        `TASK: ${task}`,
        ``,
        `You operate a web app you have never seen, through its interactive controls only.`,
        `Current page: ${page.title} ${page.url}`,
        `Controls on screen:`,
        describeAffordances(page),
        ``,
        history.length ? `Your previous actions:\n${history.map((entry, i) => `  ${i + 1}. ${entry}`).join("\n")}` : "You have taken no actions yet.",
        ``,
        `Choose exactly one next action. Use "done" only when the task is fully completed (the app confirmed it). Use set_value for search boxes, text fields, selects and checkboxes.`,
        `Never repeat an action you already took — if the page looks unchanged, pick a different control (for example, a confirm button) instead of setting the same value again.`,
      ].join("\n");

      // The classic computer-use failure is repeating an action that changed
      // nothing; a loop-breaker nudge keeps the comparison fair rather than easy.
      const lastTwo = history.slice(-2);
      const looping = lastTwo.length === 2 && lastTwo[0] === lastTwo[1];
      const { value: decision, usage } = await chatJsonUsage<BlindDecision>(
        chatModel(),
        [
          { role: "system", content: "You are a careful UI agent. One action per turn. Never invent control ids." },
          {
            role: "user",
            content: looping
              ? `${prompt}\n\nWARNING: your last two actions were identical and the page did not change. That field is already set. You MUST choose a different control this turn — look for a confirm or submit button.`
              : prompt,
          },
        ],
        BLIND_SCHEMA as unknown as Record<string, unknown>,
        { name: "ui_action" },
      );

      lane.llmCalls += 1;
      lane.tokens += usage.totalTokens;

      if (decision.action === "done" || decision.action === "give_up") {
        history.push(decision.action);
        lane.steps.push({ n: step + 1, detail: `${decision.action} — ${decision.thought.slice(0, 90)}` });
        saveRace(race);
        break;
      }

      const value =
        decision.action === "set_value"
          ? decision.value === "true"
            ? true
            : decision.value === "false"
              ? false
              : decision.value
          : undefined;
      const acted = browser.act(decision.target_id, value);
      const affordance = page.affordances.find((a) => a.id === decision.target_id);
      const label = affordance ? `"${affordance.name}"` : decision.target_id;
      history.push(`${decision.action} ${label}${value !== undefined ? ` = ${String(value).slice(0, 30)}` : ""}${acted ? "" : " (no such control!)"}`);
      lane.steps.push({ n: step + 1, detail: history[history.length - 1]! });
      if (acted) {
        lane.actions += 1;
        await browser.rendered();
      }
      lane.ms = Date.now() - started;
      saveRace(race);
    }
  } catch (error) {
    lane.error = (error as Error).message.slice(0, 200);
  } finally {
    browser.close();
  }
  lane.ms = Date.now() - started;
  lane.status = "done";
  saveRace(race);
}

async function runCompiledLane(
  race: RaceState,
  task: string,
  instance: string,
  tool: CompiledTool,
  workflow: DiscoveredWorkflow,
): Promise<void> {
  const lane = race.lanes.compiled;
  lane.status = "running";
  saveRace(race);
  const started = Date.now();

  try {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const param of workflow.params) {
      properties[param.name] =
        param.type === "string[]"
          ? { type: "array", items: { type: "string" }, description: param.description }
          : { type: param.type, description: param.description };
      if (param.required) required.push(param.name);
    }

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You complete operations tasks using the semantic actions available. Call the tool with exact parameters from the task.",
      },
      { role: "user", content: `TASK: ${task}` },
    ];
    const spec = {
      type: "function" as const,
      function: {
        name: workflow.name,
        description: `${workflow.description} (compiled from ${workflow.observed} human demonstrations)`,
        parameters: { type: "object", properties, required, additionalProperties: false },
      },
    };

    const first = await chatToolsUsage(chatModel(), messages, [spec]);
    lane.llmCalls += 1;
    lane.tokens += first.usage.totalTokens;

    const call = first.message.toolCalls[0];
    if (!call) throw new Error("model did not call the tool");
    const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
    lane.steps.push({ n: 1, detail: `${workflow.name}(${JSON.stringify(args).slice(0, 120)})` });
    saveRace(race);

    const module = await importTool(tool.code);
    const result = await module.run(toolApi(instance, workflow.endpoints, `race-${race.id}`), args);
    lane.actions += 1;

    messages.push({ role: "assistant", content: first.message.content, tool_calls: first.message.toolCalls });
    messages.push({ role: "tool", content: JSON.stringify(result).slice(0, 800), tool_call_id: call.id });
    const second = await chatToolsUsage(chatModel(), messages, [spec]);
    lane.llmCalls += 1;
    lane.tokens += second.usage.totalTokens;
    lane.steps.push({ n: 2, detail: `✓ ${second.message.content.slice(0, 110)}` });
  } catch (error) {
    lane.error = (error as Error).message.slice(0, 200);
  }
  lane.ms = Date.now() - started;
  lane.status = "done";
  saveRace(race);
}

/** Did the demonstrated effect happen on this sandbox with the expected parameters? */
async function verifyLane(
  instance: string,
  workflow: DiscoveredWorkflow,
  expected: Record<string, unknown>,
): Promise<boolean> {
  const effects = await effectsOfInstance(instance);
  return effects.some((effect) => {
    if (!effect.ok || effect.template !== workflow.signature[0]) return false;
    const got = extractParams(workflow, effect);
    return Object.entries(expected).every(([key, want]) => {
      const have = got[key];
      if (Array.isArray(want) && Array.isArray(have)) {
        return JSON.stringify([...want].sort()) === JSON.stringify([...have].sort());
      }
      return String(have) === String(want);
    });
  });
}

function taskText(workflow: DiscoveredWorkflow, params: Record<string, unknown>): string {
  const detail = Object.entries(params)
    .map(([key, value]) => `${key} = ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join("; ");
  return `${workflow.description} Specifics: ${detail}. Work in the admin app until the change is confirmed.`;
}

export async function startRace(tool: CompiledTool, workflow: DiscoveredWorkflow): Promise<string> {
  // The task replays a real held-out case, so the race is apples to apples.
  const heldOut = workflow.heldOutSessionIds[0] ?? workflow.sessionIds[0]!;
  const reference = primaryEffect(workflow, await effectsOf(heldOut));
  if (!reference) throw new Error("no reference session for the race");
  const params = extractParams(workflow, reference);
  const task = taskText(workflow, params);

  const emptyLane = (label: string): RaceLane => ({
    label,
    status: "idle",
    actions: 0,
    llmCalls: 0,
    tokens: 0,
    ms: 0,
    success: false,
    steps: [],
  });

  const race: RaceState = {
    id: `race-${Date.now().toString(36)}`,
    toolId: tool.id,
    task,
    status: "running",
    lanes: {
      blind: emptyLane("Blind UI agent (affordance click-through)"),
      compiled: emptyLane(`Compiled tool: ${workflow.name}()`),
    },
    tenor: null,
    createdAt: new Date().toISOString(),
  };
  saveRace(race);

  void (async () => {
    const [sandboxBlind, sandboxCompiled] = await Promise.all([createSandbox(), createSandbox()]);
    try {
      await Promise.all([
        runBlindLane(race, task, sandboxBlind),
        runCompiledLane(race, task, sandboxCompiled, tool, workflow),
      ]);
      race.lanes.blind.success = await verifyLane(sandboxBlind, workflow, params);
      race.lanes.compiled.success = await verifyLane(sandboxCompiled, workflow, params);

      const blindCost = laneCost(race.lanes.blind);
      const compiledCost = laneCost(race.lanes.compiled);
      const tenor: TenorReport = {
        valueUsd: CASE_VALUE_USD,
        blind: { costUsd: Number(blindCost.toFixed(4)), fitness: fitness(race.lanes.blind.success, blindCost) },
        compiled: {
          costUsd: Number(compiledCost.toFixed(4)),
          fitness: fitness(race.lanes.compiled.success, compiledCost),
        },
        multiple: Number((blindCost / Math.max(compiledCost, 1e-6)).toFixed(1)),
      };
      race.tenor = tenor;
    } catch (error) {
      race.lanes.blind.error ??= (error as Error).message.slice(0, 200);
    } finally {
      race.status = "done";
      saveRace(race);
      await Promise.all([dropSandbox(sandboxBlind), dropSandbox(sandboxCompiled)]).catch(() => undefined);
    }
  })();

  return race.id;
}

export function raceState(id: string): RaceState | undefined {
  return raceById(id);
}
