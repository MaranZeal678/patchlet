"use client";

import { useCallback, useMemo, useState } from "react";
import { outcomeLabel, outcomeTone } from "@/lib/agent/outcome";
import { escalationLabel, escalationTone, formatDateTime } from "@/lib/console/format";
import { TraceStream } from "./TraceStream";

import type { ConversationSummary } from "@/lib/console/conversations";
import type { ConsoleEscalation } from "@/lib/console/records";

type Escalation = ConsoleEscalation;
type Conversation = ConversationSummary;

type Selection =
  | { kind: "escalation"; id: string; conversationId: string | null }
  | { kind: "conversation"; id: string };

type Filter = "all" | "escalations" | "conversations";

const FILTERS: Filter[] = ["all", "escalations", "conversations"];

export function ActivityConsole({
  initialEscalations,
  initialConversations,
}: {
  initialEscalations: Escalation[];
  initialConversations: Conversation[];
}) {
  const [escalations, setEscalations] = useState<Escalation[]>(initialEscalations);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [filter, setFilter] = useState<Filter>("all");
  const [chosen, setChosen] = useState<Selection | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");

  /** Re-read the two lists after a decision, so the status chip and the links catch up. */
  const refresh = useCallback(async () => {
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
      setError("Could not refresh the activity list.");
    }
  }, []);

  const handleDecision = useCallback(() => {
    void refresh();
  }, [refresh]);

  // Nothing chosen yet means the newest escalation, or failing that the newest conversation.
  const selection = useMemo<Selection | null>(() => {
    if (chosen) return chosen;
    const escalation = escalations[0];
    if (escalation) {
      return { kind: "escalation", id: escalation.id, conversationId: escalation.conversationId };
    }
    const conversation = conversations[0];
    return conversation ? { kind: "conversation", id: conversation.id } : null;
  }, [chosen, escalations, conversations]);

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
        <div className="list-column">
          {nothingToShow ? (
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
                        setChosen({
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
                        <p className="record-card__line is-clipped" title={escalation.request.quote}>
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
                conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      className={`record-card${
                        selection?.kind === "conversation" && selection.id === conversation.id
                          ? " is-selected"
                          : ""
                      }`}
                      onClick={() => setChosen({ kind: "conversation", id: conversation.id })}
                    >
                      <div className="record-card__top">
                        <span className={`outcome-badge ${outcomeTone(conversation.outcome)}`}>
                          {outcomeLabel(conversation.outcome)}
                        </span>
                        <span className="record-card__time">
                          {formatDateTime(conversation.createdAt)}
                        </span>
                      </div>
                      <p className="record-card__summary">
                        {conversation.question ?? conversation.pageTitle ?? "Conversation"}
                      </p>
                      {conversation.pageTitle ? (
                        <p className="record-card__line is-clipped" title={conversation.pageTitle}>
                          <span className="record-card__label">Page</span>
                          {conversation.pageTitle}
                        </p>
                      ) : null}
                      <div className="record-card__meta">
                        <span>
                          {conversation.messageCount} message
                          {conversation.messageCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <section className="trace-panel">
          <div className="trace-panel__head">
            <div className="min-w-0">
              <h2 className="trace-panel__title">
                {selectedEscalation?.request?.title ??
                  (selectedConversation
                    ? (selectedConversation.question ?? "Conversation")
                    : "Live trace")}
              </h2>
              <p className="trace-panel__meta">
                {selection
                  ? `${eventCount} event${eventCount === 1 ? "" : "s"}`
                  : "Choose an escalation or a conversation."}
              </p>
            </div>
            <span className={`trace-live${live ? " is-live" : ""}`}>
              <span className="trace-live__dot" />
              {live ? "Live" : "Idle"}
            </span>
          </div>

          {selectedEscalation ? <ArtifactLinks escalation={selectedEscalation} /> : null}

          {query && selection ? (
            <TraceStream
              key={query}
              query={query}
              escalationId={selectedEscalation?.id ?? null}
              onDecision={handleDecision}
              onCount={setEventCount}
              onLive={setLive}
            />
          ) : (
            <div className="trace-body">
              <p className="trace-row__text">Nothing selected.</p>
            </div>
          )}
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
