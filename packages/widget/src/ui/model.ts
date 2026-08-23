import type { EscalationOffer, EscalationView, ProbeName, ProbeResult, Step, Verdict } from '../types';

export type ProbeState = { status: 'pending' | 'running' | 'done'; result?: ProbeResult };

export type Answer = { text: string; steps: Step[] | null; escalation: EscalationOffer };

export type Turn = {
  id: string;
  question: string;
  probes: Record<ProbeName, ProbeState>;
  feature?: string;
  verdict?: Verdict;
  answer?: Answer;
  messageId?: string;
  error?: string;
  reporting?: boolean;
  escalationId?: string;
  escalation?: EscalationView;
};

export const PROBE_ORDER: ProbeName[] = ['docs', 'interface', 'repository'];

export const PROBE_LABELS: Record<ProbeName, string> = {
  docs: 'Documentation',
  interface: 'This page',
  repository: 'Repository',
};

export function newTurn(id: string, question: string): Turn {
  return {
    id,
    question,
    probes: {
      docs: { status: 'pending' },
      interface: { status: 'pending' },
      repository: { status: 'pending' },
    },
  };
}
