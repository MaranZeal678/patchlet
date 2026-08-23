"use client";

import { outcomeLabel, outcomeTone } from "@/lib/agent/outcome";
import { formatDateTime, formatDuration } from "@/lib/console/format";
import { replayUrl } from "@/lib/console/replay";

import type { ConversationDetail, ConversationTurn } from "@/lib/console/conversations";

/** The right-hand panel: what happened, then the transcript with the guidance under each turn. */
export function ConversationDetailPanel({
  detail,
  siteUrl,
  loading,
  error,
}: {
  detail: ConversationDetail | null;
  siteUrl: string | null;
  loading: boolean;
  error: string;
}) {
  const replay = detail?.outcome === "solved" ? replayUrl(siteUrl, detail.question) : null;

  return (
    <section className="trace-panel">
      <div className="trace-panel__head">
        <div className="min-w-0">
          {detail ? (
            <span className={`outcome-badge ${outcomeTone(detail.outcome)}`}>
              {outcomeLabel(detail.outcome)}
            </span>
          ) : null}
          <h2 className="trace-panel__title mt-2">
            {detail?.question ?? (loading ? "Loading" : "No conversation selected")}
          </h2>
          {detail ? (
            <div className="detail-meta">
              {detail.pageTitle ? <span>{detail.pageTitle}</span> : null}
              <span>{formatDateTime(detail.createdAt)}</span>
              <span>{formatDuration(detail.durationMs)}</span>
              <span>
                {detail.messageCount} message{detail.messageCount === 1 ? "" : "s"}
              </span>
            </div>
          ) : null}
        </div>
        {replay ? (
          <a className="trace-link" href={replay} target="_blank" rel="noreferrer">
            Replay on site
            <span aria-hidden>&rarr;</span>
          </a>
        ) : null}
      </div>

      <div className="trace-body">
        {error ? (
          <div className="notice is-error" role="alert">
            {error}
          </div>
        ) : !detail ? (
          <p className="trace-row__text">
            {loading ? "Loading the transcript." : "Choose a conversation on the left."}
          </p>
        ) : (
          <>
            {detail.summary ? (
              <section className="detail-section">
                <h3 className="detail-section__title">What happened</h3>
                <p className="detail-summary">{detail.summary}</p>
              </section>
            ) : null}

            <section className="detail-section">
              <h3 className="detail-section__title">Transcript</h3>
              {detail.messages.length === 0 ? (
                <p className="trace-row__text">No messages were stored for this conversation.</p>
              ) : (
                <ol className="transcript">
                  {detail.messages.map((turn) => (
                    <TranscriptRow key={turn.id} turn={turn} escalation={detail.escalation} />
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </section>
  );
}

function TranscriptRow({
  turn,
  escalation,
}: {
  turn: ConversationTurn;
  escalation: ConversationDetail["escalation"];
}) {
  const agent = turn.role === "assistant";
  const steps = agent ? (turn.steps ?? []) : [];
  const request = agent ? turn.featureRequest : null;

  return (
    <li className={`transcript__row ${agent ? "is-agent" : "is-user"}`}>
      <span className="transcript__role">{agent ? "Agent" : "Asked"}</span>
      <p className="transcript__text">{turn.content}</p>

      {steps.length > 0 ? (
        <>
          <span className="turn-steps__label">Shown on the page</span>
          <ol className="turn-steps">
            {steps.map((step, index) => (
              <li key={`${step.target}-${index}`}>{step.caption}</li>
            ))}
          </ol>
        </>
      ) : null}

      {request ? (
        <div className="request-card">
          <h4>{request.title}</h4>
          <p>{request.description}</p>
          {escalation ? <RequestLinks escalation={escalation} /> : null}
        </div>
      ) : null}
    </li>
  );
}

function RequestLinks({
  escalation,
}: {
  escalation: NonNullable<ConversationDetail["escalation"]>;
}) {
  const links = [
    escalation.issueUrl
      ? { href: escalation.issueUrl, label: `Issue #${escalation.issueNumber ?? ""}`.trim() }
      : null,
    escalation.prUrl
      ? { href: escalation.prUrl, label: `Pull request #${escalation.prNumber ?? ""}`.trim() }
      : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  if (links.length === 0) return null;

  return (
    <div className="trace-links mt-3">
      {links.map((link) => (
        <a key={link.href} className="trace-link" href={link.href} target="_blank" rel="noreferrer">
          {link.label}
          <span aria-hidden>&rarr;</span>
        </a>
      ))}
    </div>
  );
}
