// Contract types shared with the API. Once @patchlet/shared is available this file
// becomes a re-export of it, so nothing else in the widget imports the contract
// from anywhere but here.

export type Affordance = {
  id: string;
  role: string;
  name: string;
  text?: string;
  landmark?: string;
  href?: string;
  visible: boolean;
  disabled?: boolean;
};

export type PageContext = { url: string; title: string; affordances: Affordance[] };

export type Step = {
  target: string;
  caption: string;
  advanceOn: 'click' | 'input' | 'navigation' | 'manual';
};

export type ProbeName = 'docs' | 'interface' | 'repository';

export type ProbeResult = {
  probe: ProbeName;
  hit: boolean;
  score: number | null;
  summary: string;
  evidence: unknown;
  latencyMs: number;
};

export type VerdictOutcome = 'answer' | 'hedge' | 'absent';

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

export type EscalationOffer = { offered: true; request: FeatureRequest } | { offered: false };

export type ChatEvent =
  | { type: 'conversation'; conversationId: string; messageId: string }
  | { type: 'understanding'; feature: string; intent: 'howto' | 'feature' | 'other' }
  | { type: 'probe'; probe: ProbeName; status: 'running' }
  | { type: 'probe'; probe: ProbeName; status: 'done'; result: ProbeResult }
  | { type: 'verdict'; verdict: Verdict }
  | { type: 'answer'; text: string; steps: Step[] | null; escalation: EscalationOffer }
  | { type: 'error'; message: string };

export type EscalationStatus =
  | 'queued'
  | 'filing'
  | 'inspecting'
  | 'drafting'
  | 'pr_open'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'merging'
  | 'deploying'
  | 'shipped'
  | 'failed';

/** Response shape of GET /api/escalations/:id. */
export type EscalationView = {
  id: string;
  status: EscalationStatus;
  issueUrl?: string | null;
  issueNumber?: number | null;
  prUrl?: string | null;
  prNumber?: number | null;
  deploymentUrl?: string | null;
  request?: FeatureRequest | null;
  approval?: { approved: boolean; note?: string; decidedAt?: string } | null;
  createdAt?: string;
};

/** Body of POST /api/chat. */
export type ChatRequest = {
  key: string;
  conversationId?: string;
  question: string;
  page: PageContext;
  continueFrom?: number;
};
