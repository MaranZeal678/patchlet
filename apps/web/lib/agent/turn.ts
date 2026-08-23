/**
 * One chat turn: understand, check three independent sources, route on the
 * evidence, then answer, hedge, or state plainly that the feature is missing.
 */
import { MODELS, routeProbes, validatePlan } from "@patchlet/shared";
import type {
  ChatEvent,
  FeatureRequest,
  PageContext,
  ProbeResult,
  Step,
  Verdict,
} from "@patchlet/shared";
import { chatJson } from "../mistral";
import { serviceClient } from "../supabase";
import { emitTrace } from "../trace";
import { probeDocs, probeInterface, probeRepository } from "./probes";
import { closeConversation } from "./summary";

export type TurnInput = {
  projectId: string;
  repoFullName: string | null;
  defaultBranch: string;
  question: string;
  page: PageContext;
  conversationId?: string;
  continueFrom?: number;
};

const UNDERSTANDING_SCHEMA = {
  type: "object",
  properties: {
    intent: { type: "string", enum: ["howto", "feature", "other"] },
    feature: { type: "string" },
  },
  required: ["intent", "feature"],
  additionalProperties: false,
};

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          target: { type: "string" },
          caption: { type: "string" },
          advanceOn: { type: "string", enum: ["click", "input", "navigation", "manual"] },
        },
        required: ["target", "caption", "advanceOn"],
        additionalProperties: false,
      },
    },
  },
  required: ["answer", "steps"],
  additionalProperties: false,
};

const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    exists: { type: "boolean" },
    confidence: { type: "number" },
    reasoning: { type: "string" },
  },
  required: ["exists", "confidence", "reasoning"],
  additionalProperties: false,
};

const REQUEST_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    area: { type: "string" },
    quote: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["title", "description", "area", "quote", "rationale"],
  additionalProperties: false,
};

function affordanceList(page: PageContext): string {
  return page.affordances
    .map((a) => `${a.id}: ${a.role} "${a.name}"${a.landmark ? ` in ${a.landmark}` : ""}`)
    .join("\n");
}

export async function* runTurn(input: TurnInput): AsyncGenerator<ChatEvent> {
  const db = serviceClient();
  const { projectId, question, page } = input;

  // 1. Persist the conversation and the user's message.
  let conversationId = input.conversationId;
  if (!conversationId) {
    const { data } = await db
      .from("conversation")
      .insert({ project_id: projectId, page_url: page.url, page_title: page.title })
      .select("id")
      .single();
    conversationId = (data?.id as string) ?? "";
  }
  const { data: userMessage } = await db
    .from("message")
    .insert({ conversation_id: conversationId, role: "user", content: question })
    .select("id")
    .single();
  const messageId = (userMessage?.id as string) ?? "";
  yield { type: "conversation", conversationId, messageId };

  // 2. Understand what the user is actually asking about.
  const understanding = await chatJson<{ intent: "howto" | "feature" | "other"; feature: string }>(
    MODELS.understand,
    [
      {
        role: "system",
        content:
          "Read one support question. Name the product capability it is about in two or three words. Answer with JSON only.",
      },
      { role: "user", content: question },
    ],
    UNDERSTANDING_SCHEMA,
    { name: "understanding" },
  );
  yield { type: "understanding", feature: understanding.feature, intent: understanding.intent };

  // 3. Three independent checks, run together so the slowest bounds the turn.
  for (const probe of ["docs", "interface", "repository"] as const) {
    yield { type: "probe", probe, status: "running" };
  }
  const [docs, ui, repository] = await Promise.all([
    probeDocs(`${question} ${understanding.feature}`, projectId),
    Promise.resolve(probeInterface(`${question} ${understanding.feature}`, page)),
    probeRepository(understanding.feature, input.repoFullName, input.defaultBranch),
  ]);
  const probes: ProbeResult[] = [docs, ui, repository];
  for (const result of probes) {
    yield { type: "probe", probe: result.probe, status: "done", result };
    void emitTrace({
      projectId,
      conversationId,
      kind: "probe",
      title: `Checked ${result.probe}`,
      status: result.hit ? "ok" : "failed",
      detail: result,
      source: "agent",
    });
  }

  // 4. Route on the evidence. Absence is confirmed by a reasoning model.
  let outcome = routeProbes(probes);
  let verdict: Verdict = {
    outcome,
    confidence: 0.8,
    reasoning: probes.map((p) => p.summary).join(" "),
    feature: understanding.feature,
  };
  if (outcome === "absent") {
    const confirmed = await chatJson<{ exists: boolean; confidence: number; reasoning: string }>(
      MODELS.verdict,
      [
        {
          role: "system",
          content:
            "Three independent checks looked for a product capability and found nothing. Decide whether the capability exists. Be conservative: say it does not exist only when the evidence supports it. JSON only.",
        },
        {
          role: "user",
          content: `Capability: ${understanding.feature}\nQuestion: ${question}\n\n${probes
            .map((p) => `${p.probe}: ${p.summary}`)
            .join("\n")}`,
        },
      ],
      VERDICT_SCHEMA,
      { name: "verdict" },
    );
    outcome = confirmed.exists ? "hedge" : "absent";
    verdict = {
      outcome,
      confidence: confirmed.confidence,
      reasoning: confirmed.reasoning,
      feature: understanding.feature,
    };
  }
  yield { type: "verdict", verdict };
  void emitTrace({
    projectId,
    conversationId,
    kind: "verdict",
    title: `Verdict: ${outcome}`,
    detail: verdict,
    source: "agent",
  });

  // 5. Answer.
  let text: string;
  let steps: Step[] | null = null;
  let request: FeatureRequest | null = null;

  if (outcome === "answer") {
    const grounding = JSON.stringify(docs.evidence);
    const plan = await chatJson<{ answer: string; steps: Step[] }>(
      MODELS.answer,
      [
        {
          role: "system",
          content:
            "You are a support agent embedded in a web page. Answer the question in one or two short sentences, then give the steps the user takes on the page in front of them. Every step target MUST be one of the listed element ids, exactly as written. Order the steps so the first one is a control that is on the page right now: if the flow continues inside a menu or dialog that is not open yet, make the first step the control that opens it and stop there. Never invent an id. Use at most 5 steps. Each caption is at most 12 words and starts with a verb. JSON only.",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nDocumentation:\n${grounding}\n\nElements on this page:\n${affordanceList(page)}`,
        },
      ],
      PLAN_SCHEMA,
      { name: "plan" },
    );
    text = plan.answer;
    // A flow often continues behind a menu that is still closed, so the later
    // targets do not exist yet. Guide as far as this page allows rather than
    // dropping the whole plan; the widget re-plans once the page changes.
    const known = new Set(page.affordances.map((a) => a.id));
    const reachable: Step[] = [];
    for (const step of plan.steps ?? []) {
      if (!known.has(step.target)) break;
      reachable.push(step);
    }
    steps = validatePlan(reachable, page.affordances);
    if (typeof input.continueFrom === "number" && steps) steps = steps.slice(input.continueFrom);
  } else {
    const drafted = await chatJson<FeatureRequest>(
      MODELS.answer,
      [
        {
          role: "system",
          content:
            "Turn one support request into a feature request for the developers. The quote must be copied exactly from the user's message. JSON only.",
        },
        { role: "user", content: question },
      ],
      REQUEST_SCHEMA,
      { name: "feature_request" },
    );
    request = {
      ...drafted,
      quote: question.includes(drafted.quote.trim()) ? drafted.quote.trim() : question,
    };
    text =
      outcome === "absent"
        ? `I am sorry, ${understanding.feature} is not available here today. I checked the documentation, this page, and the code behind it, and found nothing. I can report this to the developers so they can build it. Would you like me to?`
        : `I could not confirm that ${understanding.feature} exists here. I did not find it in the documentation or on this page. I can report it to the developers so they can look. Would you like me to?`;
  }

  const { data: assistantMessage } = await db
    .from("message")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: text,
      steps,
      probes,
      verdict,
      feature_request: request,
    })
    .select("id")
    .single();

  yield {
    type: "answer",
    text,
    steps,
    escalation: request ? { offered: true, request } : { offered: false },
  };

  // The widget escalates against the assistant message, so hand its id back.
  yield {
    type: "conversation",
    conversationId,
    messageId: (assistantMessage?.id as string) ?? messageId,
  };

  // 6. Record how this ended. The user already has the answer; this is only for the console.
  try {
    await closeConversation({ conversationId, question, answer: text, steps, verdict });
  } catch {
    // A missing outcome shows as "in progress" in the console and is not worth failing a turn.
  }
}
