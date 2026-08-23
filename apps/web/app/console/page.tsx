import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/PageHeader";
import { loadCounts, loadWorkerHeartbeat } from "@/lib/console/counts";
import { embedSnippet, loadProject } from "@/lib/console/project";

export const dynamic = "force-dynamic";

export default async function ConsoleOverviewPage() {
  const project = await loadProject();

  if (!project) {
    return (
      <>
        <PageHeader
          eyebrow="Console"
          title="Overview"
          description="The project this console manages, its embed snippet, and what the agent has been doing."
        />
        <div className="notice is-error">
          No project has been seeded yet. Run the migration and the seed script, then reload.
        </div>
      </>
    );
  }

  const [counts, heartbeat] = await Promise.all([
    loadCounts(project.id),
    loadWorkerHeartbeat(project.id),
  ]);
  const workerOnline = heartbeat !== null && Date.now() - new Date(heartbeat).getTime() < 120_000;
  const snippet = embedSnippet(project.embedKey);

  return (
    <>
      <PageHeader
        eyebrow="Console"
        title="Overview"
        description="The project this console manages, its embed snippet, and what the agent has been doing."
        actions={
          <Link href="/console/activity" className="secondary-action">
            Open the live trace
          </Link>
        }
      />

      <div className="stat-grid mb-6">
        <Stat value={counts.documents} label="Documents" />
        <Stat value={counts.chunks} label="Chunks" />
        <Stat value={counts.conversations} label="Conversations" />
        <Stat value={counts.escalations} label="Escalations" />
        <div className="stat stat--status">
          <span className={`stat__dot${workerOnline ? "" : " is-off"}`} />
          <span>
            <span className="stat__num block text-[1.05rem]">
              {workerOnline ? "Online" : "Offline"}
            </span>
            <span className="stat__label">Worker</span>
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
        <section className="panel">
          <div className="panel__head">
            <h2>Project</h2>
            <span className="count-pill">{project.slug}</span>
          </div>
          <dl className="grid gap-4">
            <Row label="Name">{project.name}</Row>
            <Row label="Site">
              {project.siteUrl ? (
                <a className="ext-link" href={project.siteUrl} target="_blank" rel="noreferrer">
                  {project.siteUrl}
                </a>
              ) : (
                <span className="text-muted">Not set</span>
              )}
            </Row>
            <Row label="Repository">
              {project.repoFullName ? (
                <span className="flex flex-wrap items-center gap-2">
                  <a
                    className="ext-link"
                    href={`https://github.com/${project.repoFullName}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {project.repoFullName}
                  </a>
                  <span className="outcome-badge is-muted">
                    {project.repoDefaultBranch ?? "main"}
                  </span>
                </span>
              ) : (
                <span className="flex flex-wrap items-center gap-2 text-muted">
                  Not connected
                  <Link href="/console/repository" className="link-button">
                    Connect GitHub
                  </Link>
                </span>
              )}
            </Row>
            <Row label="Embed key">
              <code className="mono">{project.embedKey}</code>
            </Row>
          </dl>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Embed snippet</h2>
            <CopyButton value={snippet} label="Copy" className="ghost-action" />
          </div>
          <p className="field-hint mt-0 mb-3">
            One script tag. The key names your project and nothing else, so it is safe in your page
            source.
          </p>
          <pre className="code-block">
            <code>{snippet}</code>
          </pre>
        </section>
      </div>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <span className="stat__num">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="field-label mb-0">{label}</dt>
      <dd className="m-0 text-[0.95rem]">{children}</dd>
    </div>
  );
}
