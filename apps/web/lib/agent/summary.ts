/**
 * Closes a conversation out: how it ended, and one sentence saying what happened.
 *
 * This runs after the assistant's message is stored, so a failure here costs the console a
 * summary line and never costs the user their answer.
 */
import { MODELS } from "@patchlet/shared";
import type { Step, Verdict } from "@patchlet/shared";
import { chatText } from "../mistral";
import { serviceClient } from "../supabase";
import { deriveOutcome, type ConversationOutcome } from "./outcome";

export type CloseInput = {
  conversationId: string;
  question: string;
  answer: string;
  steps: Step[] | null;
  verdict: Verdict;
};

const INSTRUCTION =
  "Summarise one support exchange in a single sentence of at most 22 words, past tense, no greeting, no quotes. Say what the user wanted and what the agent did about it.";

async function writeSummary(input: CloseInput): Promise<string> {
  const text = await chatText(
    MODELS.understand,
    [
      { role: "system", content: INSTRUCTION },
      {
        role: "user",
        content: `User asked: ${input.question}\n\nAgent replied: ${input.answer}\n\nGuidance steps given: ${
          input.steps?.length ?? 0
        }\nOutcome of the checks: ${input.verdict.outcome}`,
      },
    ],
    { maxTokens: 120 },
  );
  return text.trim().replace(/^["']|["']$/g, "").slice(0, 400);
}

/** Derives the outcome, writes a one-sentence summary, and stores both on the conversation. */
export async function closeConversation(input: CloseInput): Promise<ConversationOutcome> {
  const outcome = deriveOutcome(input);
  let summary = "";
  try {
    summary = await writeSummary(input);
  } catch {
    summary = "";
  }

  await serviceClient()
    .from("conversation")
    .update({ outcome, ...(summary ? { summary } : {}) })
    .eq("id", input.conversationId);

  return outcome;
}
