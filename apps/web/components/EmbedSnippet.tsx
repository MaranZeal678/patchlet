"use client";

import { useEffect, useState } from "react";

/** The install snippet, with the project's own key filled in once it loads. */
export function EmbedSnippet() {
  const [key, setKey] = useState("pk_your_key");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/project")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const embedKey = data?.project?.embed_key ?? data?.project?.embedKey;
        if (typeof embedKey === "string") setKey(embedKey);
      })
      .catch(() => undefined);
  }, []);

  const snippet = `<script src="https://patchlet.vercel.app/widget.js" data-key="${key}" async></script>`;

  return (
    <div className="snippet">
      <pre>
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          void navigator.clipboard.writeText(snippet);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
