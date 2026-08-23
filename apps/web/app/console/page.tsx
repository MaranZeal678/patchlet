import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/PageHeader";
import { CONVERSATION_OUTCOMES, outcomeLabel, outcomeTone } from "@/lib/agent/outcome";
import { loadOutcomeCounts } from "@/lib/console/conversations";
import { loadCounts, loadEscalationStatusCounts, loadWorkerStatus } from "@/lib/console/counts";
import { escalationLabel, escalationTone, formatDateTime } from "@/lib/console/format";
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

  const [counts, worker, outcomes, statuses] = await Promise.all([
    loadCounts(project.id),
    loadWorkerStatus(project.id),
    loadOutcomeCounts(project.id),
    loadEscalationStatusCounts(project.id),
  ]);
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
        <Stat value={counts.documents} label="Sources" />
        <Stat value={counts.chunks} label="Chunks" />
        <Stat value={outcomes.all} label="Conversations" />
        <Stat value={counts.escalations} label="Escalations" />
        <div className="stat stat--status">
          <span className={`stat__dot${worker.online ? "" : " is-off"}`} />
          <span>
            <span className="stat__num block text-[1.05rem]">
              {worker.online ? "Online" : "Offline"}
            </span>
            <span className="stat__label">
              {worker.online || !worker.lastSeenAt
                ? "Worker"
                : `Worker, last seen ${formatDateTime(worker.lastSeenAt)}`}
            </span>
          </span>
        </div>
      </div>

      <div className="mb-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
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

      <div className="mb-6 grid items-start gap-6 lg:grid-cols-2">
        <section className="panel">
          <div className="panel__head">
            <h2>Conversations</h2>
            <Link href="/console/conversations" className="link-button">
              Read them
            </Link>
          </div>
          {outcomes.all === 0 ? (
            <p className="field-hint mt-0">
              Nothing yet. Ask the widget a question on your site and it appears here.
            </p>
          ) : (
            <dl className="grid gap-3">
              {CONVERSATION_OUTCOMES.map((outcome) => (
                <Tally
                  key={outcome}
                  label={outcomeLabel(outcome)}
                  value={outcomes[outcome]}
                  tone={outcomeTone(outcome)}
                />
              ))}
            </dl>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Escalations</h2>
            <Link href="/console/activity" className="link-button">
              Follow one
            </Link>
          </div>
          {statuses.length === 0 ? (
            <p className="field-hint mt-0">
              Nothing has been reported to the developers yet.
            </p>
          ) : (
            <dl className="grid gap-3">
              {statuses.map((entry) => (
                <Tally
                  key={entry.status}
                  label={escalationLabel(entry.status)}
                  value={entry.count}
                  tone={escalationTone(entry.status)}
                />
              ))}
            </dl>
          )}
        </section>
      </div>

      <div className="shortcut-grid">
        <Shortcut
          href="/console/knowledge"
          title="Add a source"
          text="Upload the handbook, paste a page, or point at a URL. The agent answers from it."
        />
        <Shortcut
          href="/console/conversations"
          title="Read conversations"
          text="Every question, how it ended, and the steps the agent showed on the page."
        />
        <Shortcut
          href="/console/activity"
          title="Watch the live trace"
          text="Checks, verdicts, drafted issues and pull requests, as they happen."
        />
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

/** One "label ..... count" line inside a panel. */
function Tally({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="m-0">
        <span className={`outcome-badge ${tone ?? "is-muted"}`}>{label}</span>
      </dt>
      <dd className="stat__num m-0">{value}</dd>
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

function Shortcut({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="shortcut">
      <span className="shortcut__title">{title}</span>
      <span className="shortcut__text">{text}</span>
    </Link>
  );
}
