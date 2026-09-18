/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import type {
  EscalationOffer,
  EscalationView,
  FeedbackRating,
  ProbeName,
  ProbeResult,
  ReportBlock,
  Step,
  Verdict,
} from '../types';

export type ProbeState = { status: 'pending' | 'running' | 'done'; result?: ProbeResult };

export type Answer = {
  text: string;
  steps: Step[] | null;
  escalation: EscalationOffer;
  /** The agent recorded the gap for the developers on its own. */
  noted?: boolean;
};

export type Turn = {
  id: string;
  question: string;
  probes: Record<ProbeName, ProbeState>;
  feature?: string;
  /** What the agent already knew about this visitor when the turn started. */
  memory?: string[];
  verdict?: Verdict;
  answer?: Answer;
  messageId?: string;
  error?: string;
  reporting?: boolean;
  reportBlocked?: ReportBlock;
  escalationId?: string;
  escalation?: EscalationView;
  /** Set once the visitor has said whether this answer helped. */
  rating?: FeedbackRating;
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
