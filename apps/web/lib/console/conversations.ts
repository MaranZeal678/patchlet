/**
 * Reads for the Conversations page: a filterable list of what the agent handled, and the full
 * transcript behind any one of them.
 */
import type { FeatureRequest, ProbeResult, Step, Verdict } from "@patchlet/shared";
import { CONVERSATION_OUTCOMES, type ConversationOutcome } from "@/lib/agent/outcome";
import { loadVisitorFacts } from "@/lib/agent/memory";
import { serviceClient } from "@/lib/supabase";

export type ConversationEscalation = {
  id: string;
  status: string;
  issueUrl: string | null;
  issueNumber: number | null;
  prUrl: string | null;
  prNumber: number | null;
};

export type ConversationSummary = {
  id: string;
  outcome: string | null;
  summary: string | null;
  /** Verbatim from the user, supporting the outcome. */
  evidence: string[] | null;
  nextSteps: string[] | null;
  resolution: string | null;
  closeReason: string | null;
  question: string | null;
  pageUrl: string | null;
  pageTitle: string | null;
  createdAt: string;
  messageCount: number;
  durationMs: number | null;
  escalation: ConversationEscalation | null;
};

export type ConversationTurn = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  steps: Step[] | null;
  probes: ProbeResult[] | null;
  verdict: Verdict | null;
  featureRequest: FeatureRequest | null;
};

export type ConversationDetail = ConversationSummary & {
  messages: ConversationTurn[];
  /** What the agent remembers about the visitor behind this conversation, oldest first. */
  memory: string[];
};

export type OutcomeCounts = { all: number } & Record<ConversationOutcome, number>;

const CONVERSATION_COLUMNS =
  "id, page_url, page_title, outcome, summary, evidence, next_steps, resolution, close_reason, visitor_id, created_at";

const MESSAGE_COLUMNS =
  "id, conversation_id, role, content, steps, probes, verdict, feature_request, created_at";

function text(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function number(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}

/** A jsonb column the model filled: a list of strings, or nothing worth showing. */
function lines(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const kept = value.filter((entry): entry is string => typeof entry === "string" && entry.trim() !== "");
  return kept.length > 0 ? kept : null;
}

function toEscalation(row: Record<string, unknown>): ConversationEscalation {
  return {
    id: String(row.id),
    status: String(row.status),
    issueUrl: text(row.issue_url),
    issueNumber: number(row.issue_number),
    prUrl: text(row.pr_url),
    prNumber: number(row.pr_number),
  };
}

function toTurn(row: Record<string, unknown>): ConversationTurn {
  return {
    id: String(row.id),
    role: String(row.role),
    content: String(row.content),
    createdAt: String(row.created_at),
    steps: (row.steps ?? null) as Step[] | null,
    probes: (row.probes ?? null) as ProbeResult[] | null,
    verdict: (row.verdict ?? null) as Verdict | null,
    featureRequest: (row.feature_request ?? null) as FeatureRequest | null,
  };
}

/** Wall-clock time between the first and last message, or null when there is only one. */
function spanMs(times: string[]): number | null {
  const first0 = times[0];
  const last0 = times[times.length - 1];
  if (times.length < 2 || !first0 || !last0) return null;
  const first = new Date(first0).getTime();
  const last = new Date(last0).getTime();
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) return null;
  return last - first;
}

async function escalationsByConversation(
  ids: string[],
): Promise<Map<string, ConversationEscalation>> {
  const found = new Map<string, ConversationEscalation>();
  if (ids.length === 0) return found;

  const { data } = await serviceClient()
    .from("escalation")
    .select("id, conversation_id, status, issue_url, issue_number, pr_url, pr_number")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  // One conversation can only report a feature once in practice; the newest wins if it happened.
  for (const row of data ?? []) {
    found.set(String(row.conversation_id), toEscalation(row as Record<string, unknown>));
  }
  return found;
}

/** Recent conversations, newest first, optionally narrowed to one outcome. */
export async function loadConversationSummaries(
  projectId: string,
  options: { outcome?: ConversationOutcome; limit?: number } = {},
): Promise<ConversationSummary[]> {
  const db = serviceClient();
  const limit = Math.min(Math.max(options.limit ?? 60, 1), 200);

  let query = db
    .from("conversation")
    .select(CONVERSATION_COLUMNS)
    .eq("project_id", projectId);
  if (options.outcome) query = query.eq("outcome", options.outcome);

  const { data: rows, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);

  const ids = (rows ?? []).map((row) => String(row.id));
  const questions = new Map<string, string>();
  const times = new Map<string, string[]>();

  if (ids.length > 0) {
    const { data: messages } = await db
      .from("message")
      .select("conversation_id, role, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: true });

    for (const message of messages ?? []) {
      const key = String(message.conversation_id);
      times.set(key, [...(times.get(key) ?? []), String(message.created_at)]);
      if (message.role === "user" && !questions.has(key)) {
        questions.set(key, String(message.content));
      }
    }
  }

  const escalations = await escalationsByConversation(ids);

  return (rows ?? []).map((row) => {
    const id = String(row.id);
    const stamps = times.get(id) ?? [];
    return {
      id,
      outcome: text(row.outcome),
      summary: text(row.summary),
      evidence: lines(row.evidence),
      nextSteps: lines(row.next_steps),
      resolution: text(row.resolution),
      closeReason: text(row.close_reason),
      question: questions.get(id) ?? null,
      pageUrl: text(row.page_url),
      pageTitle: text(row.page_title),
      createdAt: String(row.created_at),
      messageCount: stamps.length,
      durationMs: spanMs(stamps),
      escalation: escalations.get(id) ?? null,
    };
  });
}

/** How many conversations sit under each filter pill. */
export async function loadOutcomeCounts(projectId: string): Promise<OutcomeCounts> {
  const db = serviceClient();
  const countFor = async (outcome?: ConversationOutcome): Promise<number> => {
    let query = db
      .from("conversation")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (outcome) query = query.eq("outcome", outcome);
    const { count } = await query;
    return count ?? 0;
  };

  const [all, ...perOutcome] = await Promise.all([
    countFor(),
    ...CONVERSATION_OUTCOMES.map((outcome) => countFor(outcome)),
  ]);

  const counts = { all } as OutcomeCounts;
  CONVERSATION_OUTCOMES.forEach((outcome, index) => {
    counts[outcome] = perOutcome[index] ?? 0;
  });
  return counts;
}

/** One conversation with every message in order, and the escalation it produced. */
export async function loadConversationDetail(
  projectId: string,
  id: string,
): Promise<ConversationDetail | null> {
  const db = serviceClient();
  const { data: row } = await db
    .from("conversation")
    .select(CONVERSATION_COLUMNS)
    .eq("project_id", projectId)
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;

  const { data: messages } = await db
    .from("message")
    .select(MESSAGE_COLUMNS)
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const turns = (messages ?? []).map((message) => toTurn(message as Record<string, unknown>));
  const escalation = (await escalationsByConversation([id])).get(id) ?? null;
  const memory = await loadVisitorFacts(projectId, text(row.visitor_id));

  return {
    id: String(row.id),
    outcome: text(row.outcome),
    summary: text(row.summary),
    evidence: lines(row.evidence),
    nextSteps: lines(row.next_steps),
    resolution: text(row.resolution),
    closeReason: text(row.close_reason),
    question: turns.find((turn) => turn.role === "user")?.content ?? null,
    pageUrl: text(row.page_url),
    pageTitle: text(row.page_title),
    createdAt: String(row.created_at),
    messageCount: turns.length,
    durationMs: spanMs(turns.map((turn) => turn.createdAt)),
    escalation,
    messages: turns,
    memory,
  };
}
