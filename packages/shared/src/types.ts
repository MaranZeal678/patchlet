/** An interactive element the widget found on the host page. */
export type Affordance = {
  id: string;            // opaque, e.g. "a7"; the only handle the model gets
  role: string;          // button | link | textbox | checkbox | tab | menuitem | switch | combobox
  name: string;          // accessible name
  text?: string;         // visible text when different from name
  landmark?: string;     // nearest landmark or labelled region: "sidebar", "header", "main", "dialog"
  href?: string;         // for links
  visible: boolean;      // in viewport and hit-testable
  disabled?: boolean;
};

export type PageContext = { url: string; title: string; affordances: Affordance[] };

export type Step = {
  target: string;
  caption: string;
  advanceOn: "click" | "input" | "navigation" | "manual";
};

export type ProbeName = "docs" | "interface" | "repository";

export type ProbeResult = {
  probe: ProbeName;
  hit: boolean;
  score: number | null;
  summary: string;
  evidence: unknown;
  latencyMs: number;
};

export type VerdictOutcome = "answer" | "hedge" | "absent";

export type Verdict = {
  outcome: VerdictOutcome;
  confidence: number;
  reasoning: string;
  feature: string;
};

export type FeatureRequest = {
  title: string;
  description: string;
  area: string;
  quote: string;
  rationale: string;
};

/** `/api/chat` server-sent events, in order of emission. */
export type ChatEvent =
  | { type: "conversation"; conversationId: string; messageId: string }
  | { type: "understanding"; feature: string; intent: "howto" | "feature" | "other" }
  | { type: "probe"; probe: ProbeName; status: "running" }
  | { type: "probe"; probe: ProbeName; status: "done"; result: ProbeResult }
  | { type: "verdict"; verdict: Verdict }
  | {
      type: "answer";
      text: string;
      steps: Step[] | null;
      escalation: { offered: true; request: FeatureRequest } | { offered: false };
    }
  | { type: "error"; message: string };

export type EscalationStatus =
  | "queued"
  | "filing"
  | "inspecting"
  | "drafting"
  | "pr_open"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "merging"
  | "deploying"
  | "shipped"
  | "failed";

export type TraceEvent = {
  id: number;
  projectId: string;
  conversationId: string | null;
  escalationId: string | null;
  source: "agent" | "workflow";
  kind:
    | "probe"
    | "verdict"
    | "decision"
    | "model"
    | "tool"
    | "artifact"
    | "pause"
    | "status"
    | "error";
  status: "running" | "ok" | "failed";
  title: string;
  detail: unknown;
  createdAt: string;
};
