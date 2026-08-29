/**
 * Compile: a discovered workflow becomes an executable semantic action.
 *
 * Two lineages are generated in parallel — think two Codex sessions in two
 * Reflex sandboxes given the same evidence and different temperaments:
 *
 *   api    — the shortest correct sequence of demonstrated API calls
 *   hybrid — reads state first, mutates, reads back to confirm
 *
 * Each candidate is validated (validateToolSource: only endpoints real users
 * demonstrated, no imports, no fetch, literal endpoints only), then
 * smoke-tested against a fresh sandbox of the running app with parameters
 * extracted from a real human session. The fastest valid candidate wins.
 */
import type { CompiledTool, DiscoveredWorkflow, ToolStrategy } from "@patchlet/shared";
import { validateToolSource } from "@patchlet/shared";
import type { ObservedEffect } from "@patchlet/shared";
import { saveTool, stepsOf } from "./db";
import { extractParams, primaryEffect } from "./extract";
import { createSandbox, dropSandbox, effectsOf, effectsOfInstance, toolApi } from "./target";
import { chatText, codeModel } from "../openai";

/** Loads generated ESM without the bundler noticing the import(). */
export async function importTool(code: string): Promise<{ run: (api: unknown, params: unknown) => Promise<unknown> }> {
  const url = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  const importer = new Function("u", "return import(u)") as (u: string) => Promise<{ run: never }>;
  return (await importer(url)) as { run: (api: unknown, params: unknown) => Promise<unknown> };
}

function exampleCalls(workflow: DiscoveredWorkflow, effects: { template: string; params: unknown; body: unknown; ok: boolean }[]): string {
  const byTemplate = new Map<string, { params: unknown; body: unknown }[]>();
  for (const effect of effects) {
    if (!effect.ok) continue;
    const list = byTemplate.get(effect.template) ?? [];
    if (list.length < 2) list.push({ params: effect.params, body: effect.body });
    byTemplate.set(effect.template, list);
  }
  return workflow.endpoints
    .map((template) => {
      const examples = (byTemplate.get(template) ?? [])
        .map((example) => `    api.call(${JSON.stringify(template)}, ${JSON.stringify(example.params)}, ${JSON.stringify(example.body)})`)
        .join("\n");
      return `- ${template}\n${examples}`;
    })
    .join("\n");
}

const STRATEGY_BRIEF: Record<ToolStrategy, string> = {
  api: "Make the minimum demonstrated API calls needed to perform the task. No reads unless a value must be derived.",
  hybrid:
    "Read relevant state with api.get first to validate preconditions, perform the mutation, then read back with api.get to confirm the change, and include the confirmation in the return value.",
  macro: "",
};

/**
 * Probes the read API once so codegen sees real response shapes instead of
 * guessing them — the reads live on the same resources the mutations name.
 */
async function readShapes(workflow: DiscoveredWorkflow, paramExample: Record<string, unknown>): Promise<string> {
  const sandbox = await createSandbox();
  const lines: string[] = [];
  try {
    const api = toolApi(sandbox, workflow.endpoints);
    const seen = new Set<string>();
    for (const template of workflow.endpoints) {
      const resource = template.split(" ")[1]!.replace(/\/\w+$/, ""); // "/orders/{order_id}/refund" -> "/orders/{order_id}"
      if (seen.has(resource)) continue;
      seen.add(resource);
      const path = resource.replace(/\{(\w+)\}/g, (_, name: string) => {
        const param = workflow.params.find((p) => p.source === `param:${name}`);
        return encodeURIComponent(String((param && paramExample[param.name]) ?? ""));
      });
      if (path.includes("{")) continue;
      try {
        const body = await api.get(path);
        lines.push(`  api.get("${path}") -> ${JSON.stringify(body).slice(0, 500)}`);
      } catch {
        /* read not available; codegen just won't see it */
      }
    }
  } finally {
    await dropSandbox(sandbox).catch(() => undefined);
  }
  return lines.join("\n");
}

function codegenPrompt(
  workflow: DiscoveredWorkflow,
  strategy: ToolStrategy,
  examples: string,
  paramExample: Record<string, unknown>,
  readExamples: string,
): string {
  return [
    `Write the implementation of a semantic action discovered from ${workflow.observed} recorded human sessions of a commerce admin.`,
    ``,
    `Tool: ${workflow.name}(${workflow.params.map((p) => p.name).join(", ")})`,
    `Purpose: ${workflow.description}`,
    `Parameters (already validated against demonstrated API fields):`,
    ...workflow.params.map((p) => `  - ${p.name}: ${p.type} — ${p.description} [maps to ${p.source}]`),
    `Example params object: ${JSON.stringify(paramExample)}`,
    ``,
    `Contract — plain JavaScript ES module, nothing else:`,
    `  export async function run(api, params) { ... }`,
    `  api.get(path)                          // read-only GET on the app's API, e.g. api.get("/orders/" + params.order_id)`,
    `  api.call(template, pathParams, body)   // mutation; template MUST be one of the demonstrated endpoints below, verbatim`,
    ``,
    `Demonstrated endpoints (the only mutations that exist — anything else throws):`,
    examples,
    ``,
    ...(readExamples
      ? [`Observed read responses (real shapes — note the wrapper keys):`, readExamples, ``]
      : []),
    `Strategy: ${STRATEGY_BRIEF[strategy]}`,
    `Rules: no import/require/fetch/process; api.call first argument must be a string literal; under 80 lines; return a small object summarising what happened; throw with a clear message when the app rejects the call.`,
    `Reply with ONLY the JavaScript module source, no fences, no commentary.`,
  ].join("\n");
}

function stripFences(code: string): string {
  return code.replace(/^```[a-z]*\n?/gm, "").replace(/```\s*$/gm, "").trim();
}

export async function compileWorkflow(workflow: DiscoveredWorkflow): Promise<CompiledTool[]> {
  // Evidence: real effects from this workflow's training sessions.
  const effects: ObservedEffect[] = [];
  for (const sessionId of workflow.sessionIds.slice(0, 12)) {
    effects.push(...(await effectsOf(sessionId)));
  }
  const examples = exampleCalls(workflow, effects);
  const sample = primaryEffect(workflow, effects);
  if (!sample) throw new Error(`No successful demonstration found for ${workflow.name}`);
  const paramExample = extractParams(workflow, sample);
  const readExamples = await readShapes(workflow, paramExample);

  const strategies: ToolStrategy[] = ["api", "hybrid"];
  const tools = await Promise.all(
    strategies.map(async (strategy): Promise<CompiledTool> => {
      const started = Date.now();
      let code = "";
      let smoke: CompiledTool["smoke"] = null;
      let validation: CompiledTool["validation"] = { ok: false, checks: [] };
      try {
        code = stripFences(
          await chatText(codeModel(), [
            {
              role: "system",
              content:
                "You are the code-writing half of an action compiler. You produce small, correct, dependency-free JavaScript modules and nothing else.",
            },
            { role: "user", content: codegenPrompt(workflow, strategy, examples, paramExample, readExamples) },
          ]),
        );
        validation = validateToolSource(code, workflow.endpoints);

        // One repair round: show the validator's complaints and ask again.
        if (!validation.ok) {
          const complaints = validation.checks.filter((check) => !check.ok).map((check) => `${check.name}: ${check.detail}`);
          code = stripFences(
            await chatText(codeModel(), [
              { role: "system", content: "Fix the module so it passes validation. Reply with only the corrected source." },
              {
                role: "user",
                content: `${codegenPrompt(workflow, strategy, examples, paramExample, readExamples)}\n\nPrevious attempt:\n${code}\n\nValidator rejected it:\n${complaints.join("\n")}`,
              },
            ]),
          );
          validation = validateToolSource(code, workflow.endpoints);
        }

        if (validation.ok) {
          const sandbox = await createSandbox();
          const smokeStart = Date.now();
          try {
            const module = await importTool(code);
            await module.run(toolApi(sandbox, workflow.endpoints, `smoke-${workflow.id}`), paramExample);
            const observed = await effectsOfInstance(sandbox);
            const mutated = observed.some((effect) => effect.ok && effect.template === workflow.signature[0]);
            smoke = mutated
              ? { ok: true, ms: Date.now() - smokeStart }
              : { ok: false, ms: Date.now() - smokeStart, error: "tool ran but the demonstrated effect did not happen" };
          } catch (error) {
            smoke = { ok: false, ms: Date.now() - smokeStart, error: (error as Error).message.slice(0, 300) };
          } finally {
            await dropSandbox(sandbox).catch(() => undefined);
          }
        }
      } catch (error) {
        validation = {
          ok: false,
          checks: [{ name: "codegen", ok: false, detail: (error as Error).message.slice(0, 300) }],
        };
      }

      const tool: CompiledTool = {
        id: `tool-${workflow.name}-${strategy}`,
        workflowId: workflow.id,
        name: workflow.name,
        strategy,
        code,
        validation,
        smoke,
        status: validation.ok && smoke?.ok ? "validated" : "rejected",
        runtime: `${Date.now() - started}ms`,
        createdAt: new Date().toISOString(),
      };
      saveTool(tool);
      return tool;
    }),
  );

  return tools;
}

/** Sample trajectory captions — shown beside the compiled code in the console. */
export function humanPathOf(workflowSessionId: string): string[] {
  return stepsOf(workflowSessionId).map((step) => {
    const value = step.action.value !== undefined ? ` = ${String(step.action.value).slice(0, 30)}` : "";
    return `${step.action.kind} · ${step.action.target.name}${value}`;
  });
}
