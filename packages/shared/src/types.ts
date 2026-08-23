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
  state?: string;        // "selected", "expanded", "checked" and so on, when the control has one
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

/** Body of `POST /api/chat`. */
export type ChatRequest = {
  key: string;
  conversationId?: string;
  /** Random id the widget keeps in the visitor's browser, the key of the agent's memory. */
  visitorId?: string;
  question: string;
  page: PageContext;
  continueFrom?: number;
};

/** Body of `POST /api/escalate`. */
export type EscalateRequest = {
  key: string;
  conversationId?: string;
  messageId: string;
  visitorId?: string;
};

/**
 * Whether the agent offered to report a missing feature.
 *
 * `reason` says why it could not: today the only one is a project with no repository bound, which
 * the widget explains rather than offering a button that cannot work.
 */
export type EscalationOffer =
  | { offered: true; request: FeatureRequest }
  | { offered: false; reason?: "no_repository" };

/** `/api/chat` server-sent events, in order of emission. */
export type ChatEvent =
  | { type: "conversation"; conversationId: string; messageId: string }
  | {
      type: "understanding";
      feature: string;
      intent: "howto" | "feature" | "other";
      /** What the agent already knows about this visitor, oldest first. Empty on a first visit. */
      memory: string[];
    }
  | { type: "probe"; probe: ProbeName; status: "running" }
  | { type: "probe"; probe: ProbeName; status: "done"; result: ProbeResult }
  | { type: "verdict"; verdict: Verdict }
  | {
      type: "answer";
      text: string;
      steps: Step[] | null;
      escalation: EscalationOffer;
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
