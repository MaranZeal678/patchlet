"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TraceEvent } from "@patchlet/shared";
import { escalationLabel, escalationTone, formatDateTime } from "@/lib/console/format";
import { TraceRow } from "./TraceRow";

type Escalation = {
  id: string;
  conversationId: string | null;
  status: string;
  request: { title?: string; description?: string; quote?: string } | null;
  issueUrl: string | null;
  issueNumber: number | null;
  prUrl: string | null;
  prNumber: number | null;
  deploymentUrl: string | null;
  createdAt: string;
};

type Conversation = {
  id: string;
  pageUrl: string | null;
  pageTitle: string | null;
  createdAt: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
};

type Selection =
  | { kind: "escalation"; id: string; conversationId: string | null }
  | { kind: "conversation"; id: string };

type Filter = "all" | "escalations" | "conversations";

const FILTERS: Filter[] = ["all", "escalations", "conversations"];

export function ActivityConsole() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const body = useRef<HTMLDivElement>(null);
  // Autoscroll follows the tail, but stops the moment the reader scrolls up to read something.
  const pinned = useRef(true);

  const loadRecords = useCallback(async () => {
    try {
      const [escalationResponse, conversationResponse] = await Promise.all([
        fetch("/api/escalations"),
        fetch("/api/conversations?limit=40"),
      ]);
      const escalationBody = (await escalationResponse.json()) as { escalations?: Escalation[] };
      const conversationBody = (await conversationResponse.json()) as {
        conversations?: Conversation[];
      };
      setEscalations(escalationBody.escalations ?? []);
      setConversations(conversationBody.conversations ?? []);
    } catch {
      setError("Could not load the activity list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // Select the newest escalation, or the newest conversation, as soon as one exists.
  useEffect(() => {
    if (selection) return;
    const escalation = escalations[0];
    if (escalation) {
      setSelection({
        kind: "escalation",
        id: escalation.id,
        conversationId: escalation.conversationId,
      });
      return;
    }
    const conversation = conversations[0];
    if (conversation) setSelection({ kind: "conversation", id: conversation.id });
  }, [escalations, conversations, selection]);

  const query = useMemo(() => {
    if (!selection) return null;
    const params = new URLSearchParams();
    if (selection.kind === "escalation") {
      params.set("escalationId", selection.id);
      if (selection.conversationId) params.set("conversationId", selection.conversationId);
    } else {
      params.set("conversationId", selection.id);
    }
    return params.toString();
  }, [selection]);

  // Backfill, then tail. The stream resumes from the last id the backfill returned, so nothing is
  // shown twice and nothing between the two requests is lost.
  useEffect(() => {
    if (!query) return;
    let active = true;
    let source: EventSource | null = null;

    setEvents([]);
    setLive(false);
    pinned.current = true;

    (async () => {
      let cursor = 0;
      try {
        const response = await fetch(`/api/trace?${query}&limit=500`);
        const payload = (await response.json()) as { events?: TraceEvent[]; error?: string };
        if (!active) return;
        if (payload.error) setError(payload.error);
        const backfill = payload.events ?? [];
        setEvents(backfill);
        cursor = backfill.length > 0 ? (backfill[backfill.length - 1]?.id ?? 0) : 0;
      } catch {
        if (active) setError("Could not load the trace.");
      }

      if (!active) return;
      source = new EventSource(`/api/trace/stream?${query}&since=${cursor}`);
      source.addEventListener("open", () => setLive(true));
      source.addEventListener("trace", (message) => {
        try {
          const event = JSON.parse((message as MessageEvent<string>).data) as TraceEvent;
          setEvents((current) =>
            current.some((existing) => existing.id === event.id) ? current : [...current, event],
          );
        } catch {
          // A malformed frame is not worth interrupting the stream for.
        }
      });
      source.addEventListener("error", () => setLive(false));
    })();

    return () => {
      active = false;
      source?.close();
      setLive(false);
    };
  }, [query]);

  useEffect(() => {
    const node = body.current;
    if (node && pinned.current) node.scrollTop = node.scrollHeight;
  }, [events]);

  const selectedEscalation =
    selection?.kind === "escalation"
      ? (escalations.find((row) => row.id === selection.id) ?? null)
      : null;
  const selectedConversation =
    selection?.kind === "conversation"
      ? (conversations.find((row) => row.id === selection.id) ?? null)
      : null;

  const showEscalations = filter !== "conversations";
  const showConversations = filter !== "escalations";
  const nothingToShow =
    (showEscalations ? escalations.length : 0) + (showConversations ? conversations.length : 0) === 0;

  return (
    <>
      <div className="filter-row">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            className={`filter-chip${filter === value ? " is-active" : ""}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "All" : value === "escalations" ? "Escalations" : "Conversations"}
            <span className="filter-chip__count">
              {value === "all"
                ? escalations.length + conversations.length
                : value === "escalations"
                  ? escalations.length
                  : conversations.length}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="notice is-error mb-4" role="alert">
          {error}
        </div>
      ) : null}

      <div className="activity-grid">
        <div className="activity-list">
          {loading ? (
            <div className="notice">Loading activity...</div>
          ) : nothingToShow ? (
            <div className="empty-state">
              <p className="empty-state__title">Nothing has happened yet</p>
              <p className="empty-state__text">
                Ask the widget a question on your site. The conversation, every check and every
                artefact appear here as they happen.
              </p>
            </div>
          ) : (
            <ul className="record-list">
              {showEscalations &&
                escalations.map((escalation) => (
                  <li key={escalation.id}>
                    <button
                      type="button"
                      className={`record-card${
                        selection?.kind === "escalation" && selection.id === escalation.id
                          ? " is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelection({
                          kind: "escalation",
                          id: escalation.id,
                          conversationId: escalation.conversationId,
                        })
                      }
                    >
                      <div className="record-card__top">
                        <span className={`outcome-badge ${escalationTone(escalation.status)}`}>
                          {escalationLabel(escalation.status)}
                        </span>
                        <span className="record-card__time">
                          {formatDateTime(escalation.createdAt)}
                        </span>
                      </div>
                      <p className="record-card__summary">
                        {escalation.request?.title ?? "Feature request"}
                      </p>
                      {escalation.request?.quote ? (
                        <p className="record-card__line">
                          <span className="record-card__label">Asked</span>
                          {escalation.request.quote}
                        </p>
                      ) : null}
                      <div className="record-card__meta">
                        {escalation.issueNumber !== null ? (
                          <span>issue #{escalation.issueNumber}</span>
                        ) : null}
                        {escalation.prNumber !== null ? <span>pr #{escalation.prNumber}</span> : null}
                        {escalation.deploymentUrl ? <span>deployed</span> : null}
                      </div>
                    </button>
                  </li>
                ))}

              {showConversations &&
                conversations.map((conversation) => {
                  const question = conversation.messages.find((message) => message.role === "user");
                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        className={`record-card${
                          selection?.kind === "conversation" && selection.id === conversation.id
                            ? " is-selected"
                            : ""
                        }`}
                        onClick={() => setSelection({ kind: "conversation", id: conversation.id })}
                      >
                        <div className="record-card__top">
                          <span className="outcome-badge is-muted">conversation</span>
                          <span className="record-card__time">
                            {formatDateTime(conversation.createdAt)}
                          </span>
                        </div>
                        <p className="record-card__summary">
                          {question?.content ?? conversation.pageTitle ?? "Conversation"}
                        </p>
                        {conversation.pageTitle ? (
                          <p className="record-card__line">
                            <span className="record-card__label">Page</span>
                            {conversation.pageTitle}
                          </p>
                        ) : null}
                        <div className="record-card__meta">
                          <span>
                            {conversation.messages.length} message
                            {conversation.messages.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        <section className="trace-panel">
          <div className="trace-panel__head">
            <div className="min-w-0">
              <h2 className="trace-panel__title">
                {selectedEscalation?.request?.title ??
                  (selectedConversation
                    ? (selectedConversation.messages.find((message) => message.role === "user")
                        ?.content ?? "Conversation")
                    : "Live trace")}
              </h2>
              <p className="trace-panel__meta">
                {selection
                  ? `${events.length} event${events.length === 1 ? "" : "s"}`
                  : "Choose an escalation or a conversation."}
              </p>
            </div>
            <span className={`trace-live${live ? " is-live" : ""}`}>
              <span className="trace-live__dot" />
              {live ? "Live" : "Idle"}
            </span>
          </div>

          {selectedEscalation ? <ArtifactLinks escalation={selectedEscalation} /> : null}

          <div
            className="trace-body"
            ref={body}
            onScroll={(scrollEvent) => {
              const node = scrollEvent.currentTarget;
              pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 60;
            }}
          >
            {events.length === 0 ? (
              <p className="trace-row__text">
                {selection
                  ? "No trace rows for this selection yet. New ones stream in as they happen."
                  : "Nothing selected."}
              </p>
            ) : (
              events.map((event) => (
                <TraceRow
                  key={event.id}
                  event={event}
                  escalationId={event.escalationId ?? selectedEscalation?.id ?? null}
                  onDecision={() => void loadRecords()}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

/** The escalation's own artefacts, always reachable without hunting through the trace. */
function ArtifactLinks({ escalation }: { escalation: Escalation }) {
  const links = [
    escalation.issueUrl
      ? { href: escalation.issueUrl, label: `Issue #${escalation.issueNumber ?? ""}`.trim() }
      : null,
    escalation.prUrl
      ? { href: escalation.prUrl, label: `Pull request #${escalation.prNumber ?? ""}`.trim() }
      : null,
    escalation.deploymentUrl ? { href: escalation.deploymentUrl, label: "Deployment" } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  if (links.length === 0) return null;

  return (
    <div className="trace-links border-b border-[var(--hairline)] px-[22px] py-3">
      {links.map((link) => (
        <a key={link.href} className="trace-link" href={link.href} target="_blank" rel="noreferrer">
          {link.label}
          <span aria-hidden>&rarr;</span>
        </a>
      ))}
    </div>
  );
}
