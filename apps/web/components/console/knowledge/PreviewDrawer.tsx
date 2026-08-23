"use client";

import { useEffect, useState } from "react";
import type { ConsoleDocument, IngestPage } from "@/lib/ingest/types";

/** Anything read less confidently than this is tinted, so a bad scan is obvious. */
const LOW_CONFIDENCE = 0.6;

type Props = {
  document: ConsoleDocument;
  onClose: () => void;
};

/** What the reader actually extracted, page by page. */
export function PreviewDrawer({ document, onClose }: Props) {
  const [pages, setPages] = useState<IngestPage[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // One drawer belongs to one source: the parent remounts it rather than resetting it.
  useEffect(() => {
    let live = true;
    fetch(`/api/documents/${document.id}`)
      .then(async (response) => {
        const result = (await response.json()) as {
          document?: ConsoleDocument & { pages: IngestPage[] };
          error?: string;
        };
        if (!response.ok || !result.document) throw new Error(result.error ?? "Nothing to show.");
        if (live) setPages(result.document.pages);
      })
      .catch((failure: unknown) => {
        if (live) setError(failure instanceof Error ? failure.message : "Nothing to show.");
      });
    return () => {
      live = false;
    };
  }, [document.id]);

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label={`What was read from ${document.title}`}>
      <button type="button" className="drawer__scrim" aria-label="Close the preview" onClick={onClose} />
      <div className="drawer__panel">
        <div className="drawer__head">
          <div>
            <h2 className="drawer__title">{document.title}</h2>
            <p className="field-hint mt-1 mb-0">
              {document.meanConfidence === null
                ? "Text as it was parsed, before it was split into passages."
                : `Scanned text, read at ${document.meanConfidence.toFixed(2)} confidence. Anything under ${LOW_CONFIDENCE.toFixed(2)} is tinted.`}
            </p>
          </div>
          <button type="button" className="ghost-action" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="drawer__body">
          {error ? <div className="notice is-error">{error}</div> : null}
          {!error && pages === null ? <p className="field-hint m-0">Loading...</p> : null}
          {pages?.length === 0 ? (
            <p className="field-hint m-0">Nothing was stored for this source.</p>
          ) : null}
          {(pages ?? []).map((page) => (
            <PageCard key={page.page} page={page} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageCard({ page }: { page: IngestPage }) {
  // A page from a crawl has no blocks of its own worth splitting apart; show it whole.
  const blocks =
    page.blocks.length > 0
      ? page.blocks
      : [{ type: "text", content: page.markdown, confidence: page.confidence }];

  return (
    <section className="page-card">
      <header className="page-card__head">
        <span>Page {page.page}</span>
        {page.confidence === null ? null : <span>read at {page.confidence.toFixed(2)}</span>}
        {page.sourceRef ? <span className="normal-case tracking-normal">{page.sourceRef}</span> : null}
      </header>
      {blocks.map((block, index) => {
        const low = block.confidence !== null && block.confidence < LOW_CONFIDENCE;
        return (
          <p key={index} className={`page-block${low ? " is-low" : ""}`}>
            {block.confidence === null ? null : (
              <span className="page-block__score">{block.confidence.toFixed(2)}</span>
            )}
            {block.content}
          </p>
        );
      })}
    </section>
  );
}
