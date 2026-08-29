/**
 * Prove equivalence — the step that makes this a product, not a code generator.
 *
 * For each held-out human session (never shown to the compiler): extract the
 * parameters the human actually used, run the compiled tool with them against
 * a fresh sandbox of the app, and diff the resulting state transition against
 * the transition the human's clicks produced. Every diff has to match,
 * normalized for volatile fields; ids and timestamps aside, the tool must do
 * exactly what the person did. Only then does the tool ship.
 */
import type { CompiledTool, DiscoveredWorkflow, EquivalenceProof, ProofCase } from "@patchlet/shared";
import { saveProof, saveTool } from "./db";
import { extractParams, normalizeDiffs, primaryEffect } from "./extract";
import { createSandbox, dropSandbox, effectsOf, effectsOfInstance, toolApi } from "./target";
import { importTool } from "./compile";

export async function proveTool(tool: CompiledTool, workflow: DiscoveredWorkflow): Promise<EquivalenceProof> {
  const cases: ProofCase[] = [];

  for (const sessionId of workflow.heldOutSessionIds) {
    const humanEffects = await effectsOf(sessionId);
    const reference = primaryEffect(workflow, humanEffects);
    if (!reference) continue;

    const params = extractParams(workflow, reference);
    const humanTransition = normalizeDiffs(reference.diffs);

    const sandbox = await createSandbox();
    let toolTransition: string[] = [];
    let note = "";
    let match = false;
    try {
      const module = await importTool(tool.code);
      await module.run(toolApi(sandbox, workflow.endpoints, `proof-${sessionId.slice(0, 8)}`), params);
      const observed = await effectsOfInstance(sandbox);
      const mirrored = observed.find((effect) => effect.ok && effect.template === workflow.signature[0]);
      if (!mirrored) {
        note = "tool ran but never produced the demonstrated effect";
      } else {
        toolTransition = normalizeDiffs(mirrored.diffs);
        const human = new Set(humanTransition);
        const missing = humanTransition.filter((line) => !toolTransition.includes(line));
        const extra = toolTransition.filter((line) => !human.has(line));
        match = missing.length === 0 && extra.length === 0;
        note = match
          ? `state transition identical across ${humanTransition.length} changed fields`
          : `missing: ${missing.slice(0, 3).join("; ") || "none"} | extra: ${extra.slice(0, 3).join("; ") || "none"}`;
      }
    } catch (error) {
      note = `tool threw: ${(error as Error).message.slice(0, 200)}`;
    } finally {
      await dropSandbox(sandbox).catch(() => undefined);
    }

    cases.push({ sessionId, params, match, note, humanTransition, toolTransition });
  }

  const ok = cases.length > 0 && cases.every((c) => c.match);
  const proof: EquivalenceProof = {
    id: `proof-${tool.id}-${Date.now().toString(36)}`,
    toolId: tool.id,
    cases,
    ok,
    createdAt: new Date().toISOString(),
  };
  saveProof(proof);

  if (ok) {
    tool.status = "proven";
    saveTool(tool);
  }
  return proof;
}
