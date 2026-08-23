import { describe, expect, it } from "vitest";
import type { Step, Verdict } from "@patchlet/shared";
import {
  deriveOutcome,
  isConversationOutcome,
  outcomeLabel,
  outcomeTone,
} from "@/lib/agent/outcome";

const step: Step = { target: "a1", caption: "Open the account menu", advanceOn: "click" };

function verdict(outcome: Verdict["outcome"]): Verdict {
  return { outcome, confidence: 0.9, reasoning: "", feature: "dark mode" };
}

describe("deriveOutcome", () => {
  it("counts guidance on the page as solved", () => {
    expect(deriveOutcome({ steps: [step], verdict: verdict("answer") })).toBe("solved");
  });

  it("stays solved even when the checks only hedged, because the user was still shown the way", () => {
    expect(deriveOutcome({ steps: [step], verdict: verdict("hedge") })).toBe("solved");
  });

  it("calls a confirmed absence a missing feature", () => {
    expect(deriveOutcome({ steps: null, verdict: verdict("absent") })).toBe("missing_feature");
  });

  it("calls a hedge unresolved", () => {
    expect(deriveOutcome({ steps: null, verdict: verdict("hedge") })).toBe("unresolved");
  });

  it("calls an answer with no usable steps unresolved, because nothing was shown", () => {
    expect(deriveOutcome({ steps: [], verdict: verdict("answer") })).toBe("unresolved");
    expect(deriveOutcome({ steps: null, verdict: verdict("answer") })).toBe("unresolved");
  });
});

describe("outcome labels", () => {
  it("accepts only the three stored values", () => {
    expect(isConversationOutcome("solved")).toBe(true);
    expect(isConversationOutcome("missing_feature")).toBe(true);
    expect(isConversationOutcome("unresolved")).toBe(true);
    expect(isConversationOutcome("shipped")).toBe(false);
  });

  it("reads as plain English, and says so when a turn is still running", () => {
    expect(outcomeLabel("solved")).toBe("Solved");
    expect(outcomeLabel("missing_feature")).toBe("Missing feature");
    expect(outcomeLabel(null)).toBe("In progress");
    expect(outcomeTone("solved")).toBe("is-good");
    expect(outcomeTone(null)).toBe("is-muted");
  });
});
