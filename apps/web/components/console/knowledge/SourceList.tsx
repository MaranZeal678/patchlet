"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/console/format";
import type { ConsoleDocument } from "@/lib/ingest/types";
import { SOURCE_MODE_LABEL } from "./AddSource";

/** How the stored kind reads in the list. */
const KIND_LABEL: Record<string, string> = {
  text: SOURCE_MODE_LABEL.text,
  url: SOURCE_MODE_LABEL.url,
  upload: SOURCE_MODE_LABEL.file,
};

const STATUS_TONE: Record<string, string> = {
  ready: "is-good",
  processing: "is-run",
  pending: "is-wait",
  failed: "is-bad",
};

type Props = {
  documents: ConsoleDocument[];
  busyId: string | null;
  onPreview: (document: ConsoleDocument) => void;
  onReindex: (document: ConsoleDocument) => void;
  onDelete: (document: ConsoleDocument) => void;
};

export function SourceList({ documents, busyId, onPreview, onReindex, onDelete }: Props) {
  const [confirming, setConfirming] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No sources yet</p>
        <p className="empty-state__text">
          Add a handbook, a documentation site or a note on the left. It shows up here with what was
          read out of it.
        </p>
      </div>
    );
  }

  return (
    <ul className="record-list">
      {documents.map((document) => {
        const busy = busyId === document.id;
        // A file was never kept, only what was read out of it, so only these two can be read again.
        const rereadable = document.sourceKind === "url" || document.sourceKind === "text";

        return (
          <li key={document.id}>
            <article className="source-row">
              <div className="source-row__top">
                <p className="source-row__title">{document.title}</p>
                <span className="outcome-badge is-muted">
                  {KIND_LABEL[document.sourceKind] ?? document.sourceKind}
                </span>
                <span className="source-row__time" suppressHydrationWarning>
                  {formatRelativeTime(document.createdAt)}
                </span>
              </div>

              {document.sourceRef ? (
                <p className="record-card__line">
                  <span className="record-card__label">Source</span>
                  {document.sourceRef}
                </p>
              ) : null}

              {document.error ? (
                <p className="record-card__line">
                  <span className="record-card__label">Error</span>
                  {document.error}
                </p>
              ) : null}

              <div className="source-row__meta">
                <span className={`outcome-badge ${STATUS_TONE[document.status] ?? "is-muted"}`}>
                  {document.status}
                </span>
                {document.pageCount === null ? null : (
                  <span>{document.pageCount} pages</span>
                )}
                <span>{document.chunkCount} chunks</span>
                {document.meanConfidence === null ? null : (
                  <span>read at {document.meanConfidence.toFixed(2)}</span>
                )}
              </div>

              <div className="source-row__actions">
                <button
                  type="button"
                  className="row-action"
                  onClick={() => onPreview(document)}
                  disabled={busy}
                >
                  Preview
                </button>
                {rereadable ? (
                  <button
                    type="button"
                    className="row-action"
                    onClick={() => onReindex(document)}
                    disabled={busy}
                  >
                    {busy ? "Working..." : "Re-index"}
                  </button>
                ) : null}
                {confirming === document.id ? (
                  <>
                    <button
                      type="button"
                      className="row-action is-danger"
                      onClick={() => {
                        setConfirming(null);
                        onDelete(document);
                      }}
                      disabled={busy}
                    >
                      Delete it
                    </button>
                    <button
                      type="button"
                      className="row-action"
                      onClick={() => setConfirming(null)}
                    >
                      Keep it
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="row-action is-danger"
                    onClick={() => setConfirming(document.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
