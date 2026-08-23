/**
 * How a conversation ended, in the words a support lead would use.
 *
 * The rule is deliberately mechanical so the console never disagrees with the transcript:
 * guidance on the page means the user was shown what to do; a confirmed absence means the
 * product is missing something; anything else is an answer the agent could not stand behind.
 */
import type { Step, Verdict } from "@patchlet/shared";

export type ConversationOutcome = "solved" | "missing_feature" | "unresolved";

export const CONVERSATION_OUTCOMES: readonly ConversationOutcome[] = [
  "solved",
  "missing_feature",
  "unresolved",
];

export function isConversationOutcome(value: string): value is ConversationOutcome {
  return (CONVERSATION_OUTCOMES as readonly string[]).includes(value);
}

export function deriveOutcome(input: {
  steps: Step[] | null;
  verdict: Pick<Verdict, "outcome">;
}): ConversationOutcome {
  if (input.steps && input.steps.length > 0) return "solved";
  if (input.verdict.outcome === "absent") return "missing_feature";
  return "unresolved";
}

const LABELS: Record<ConversationOutcome, string> = {
  solved: "Solved",
  missing_feature: "Missing feature",
  unresolved: "Unresolved",
};

export function outcomeLabel(outcome: string | null): string {
  return outcome && isConversationOutcome(outcome) ? LABELS[outcome] : "In progress";
}

const TONES: Record<ConversationOutcome, string> = {
  solved: "is-good",
  missing_feature: "is-wait",
  unresolved: "is-muted",
};

export function outcomeTone(outcome: string | null): string {
  return outcome && isConversationOutcome(outcome) ? TONES[outcome] : "is-muted";
}
