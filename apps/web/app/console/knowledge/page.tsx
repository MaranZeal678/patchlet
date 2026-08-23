import { PageHeader } from "@/components/PageHeader";
import { loadProject } from "@/lib/console/project";
import { serviceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type DocumentRow = {
  id: string;
  title: string;
  source_kind: string;
  source_ref: string | null;
  status: string;
  page_count: number | null;
  mean_confidence: number | null;
  chunk_count: number;
  error: string | null;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  ready: "is-good",
  processing: "is-run",
  pending: "is-wait",
  failed: "is-bad",
};

export default async function KnowledgePage() {
  const project = await loadProject();
  const documents = project ? await loadDocuments(project.id) : [];
  const chunkTotal = documents.reduce((total, row) => total + Number(row.chunk_count ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title="What the agent answers from"
        description="Every source Patchlet has ingested for this project, with how many chunks it produced and how well the scanned pages read."
      />

      {documents.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No sources yet</p>
          <p className="empty-state__text">
            Ingest a handbook, a PDF or a URL and it shows up here with its page count, its chunk
            count and its mean reading confidence.
          </p>
        </div>
      ) : (
        <>
          <div className="stat-grid mb-6">
            <div className="stat">
              <span className="stat__num">{documents.length}</span>
              <span className="stat__label">Sources</span>
            </div>
            <div className="stat">
              <span className="stat__num">{chunkTotal}</span>
              <span className="stat__label">Chunks</span>
            </div>
            <div className="stat">
              <span className="stat__num">
                {documents.filter((row) => row.status === "ready").length}
              </span>
              <span className="stat__label">Ready</span>
            </div>
          </div>

          <ul className="record-list">
            {documents.map((row) => (
              <li key={row.id}>
                <article className="record-card cursor-default">
                  <div className="record-card__top">
                    <span className={`outcome-badge ${STATUS_TONE[row.status] ?? "is-muted"}`}>
                      {row.status}
                    </span>
                    <span className="outcome-badge is-muted">{row.source_kind}</span>
                    <span className="record-card__time">{formatDate(row.created_at)}</span>
                  </div>
                  <p className="record-card__summary">{row.title}</p>
                  {row.source_ref ? (
                    <p className="record-card__line">
                      <span className="record-card__label">Source</span>
                      {row.source_ref}
                    </p>
                  ) : null}
                  {row.error ? (
                    <p className="record-card__line">
                      <span className="record-card__label">Error</span>
                      {row.error}
                    </p>
                  ) : null}
                  <div className="record-card__meta">
                    <span>{row.chunk_count} chunks</span>
                    {row.page_count !== null ? <span>{row.page_count} pages</span> : null}
                    {row.mean_confidence !== null ? (
                      <span>reading confidence {row.mean_confidence.toFixed(2)}</span>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

async function loadDocuments(projectId: string): Promise<DocumentRow[]> {
  const { data } = await serviceClient()
    .from("document")
    .select(
      "id, title, source_kind, source_ref, status, page_count, mean_confidence, chunk_count, error, created_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (data ?? []) as DocumentRow[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
