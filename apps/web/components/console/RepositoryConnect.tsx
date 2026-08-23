"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type Repository = {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  htmlUrl: string;
  updatedAt: string | null;
};

type Props = {
  initialRepoFullName: string | null;
  initialDefaultBranch: string | null;
  /** The linked GitHub account, when a user completed the OAuth flow. */
  githubLogin: string | null;
  githubAvatar: string | null;
  /** False when the deployment has no GitHub OAuth app, so only the server credential exists. */
  oauthAvailable: boolean;
  linkError: string;
};

/**
 * Link a GitHub account, pick a repository, bind it to the project.
 *
 * Without a linked account the page still works: the repository list comes back through the
 * server credential in GITHUB_TOKEN, which is exactly what the agent and the worker use.
 */
export function RepositoryConnect({
  initialRepoFullName,
  initialDefaultBranch,
  githubLogin,
  githubAvatar,
  oauthAvailable,
  linkError,
}: Props) {
  const router = useRouter();
  const [bound, setBound] = useState<{ fullName: string; defaultBranch: string } | null>(
    initialRepoFullName
      ? { fullName: initialRepoFullName, defaultBranch: initialDefaultBranch ?? "main" }
      : null,
  );
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingFullName, setSavingFullName] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState(linkError);

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/github/repositories");
      const result = (await response.json()) as { repositories?: Repository[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "GitHub did not answer.");
      setRepositories(result.repositories ?? []);
      setPicking(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not reach GitHub.");
    } finally {
      setLoading(false);
    }
  }, []);

  const bind = useCallback(
    async (repository: Repository) => {
      setSavingFullName(repository.fullName);
      setError("");
      try {
        const response = await fetch("/api/project", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ repoFullName: repository.fullName }),
        });
        const result = (await response.json()) as {
          project?: { repoFullName: string | null; repoDefaultBranch: string | null };
          error?: string;
        };
        if (!response.ok || !result.project?.repoFullName) {
          throw new Error(result.error ?? "The repository could not be bound.");
        }
        setBound({
          fullName: result.project.repoFullName,
          defaultBranch: result.project.repoDefaultBranch ?? repository.defaultBranch,
        });
        setPicking(false);
        setRepositories([]);
        setSearch("");
      } catch (bindError) {
        setError(bindError instanceof Error ? bindError.message : "The repository could not be bound.");
      } finally {
        setSavingFullName(null);
      }
    },
    [],
  );

  const unlink = useCallback(async () => {
    setUnlinking(true);
    setError("");
    try {
      const response = await fetch("/api/github/disconnect", { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The account could not be unlinked.");
      setPicking(false);
      setRepositories([]);
      router.refresh();
    } catch (unlinkError) {
      setError(unlinkError instanceof Error ? unlinkError.message : "The account could not be unlinked.");
    } finally {
      setUnlinking(false);
    }
  }, [router]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return repositories;
    return repositories.filter(
      (repository) =>
        repository.fullName.toLowerCase().includes(needle) ||
        (repository.description ?? "").toLowerCase().includes(needle),
    );
  }, [repositories, search]);

  const connected = Boolean(githubLogin) || !oauthAvailable;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
      <section className="panel">
        <div className="panel__head">
          <h2>{connected ? "GitHub" : "Connect GitHub"}</h2>
          {bound ? <span className="count-pill">bound</span> : null}
        </div>

        {error ? (
          <div className="notice is-error mb-4" role="alert">
            {error}
          </div>
        ) : null}

        {connected ? (
          <div className="grid gap-5">
            <Identity
              login={githubLogin}
              avatar={githubAvatar}
              unlinking={unlinking}
              onUnlink={() => void unlink()}
            />

            {bound && !picking ? (
              <BoundRepository
                fullName={bound.fullName}
                defaultBranch={bound.defaultBranch}
                onChange={() => void loadRepositories()}
              />
            ) : picking ? (
              <RepositoryPicker
                repositories={filtered}
                total={repositories.length}
                search={search}
                savingFullName={savingFullName}
                onSearch={setSearch}
                onPick={bind}
              />
            ) : (
              <div className="grid gap-4">
                <p className="field-hint m-0">
                  Choose the repository the agent reads for evidence and files its issues and draft
                  pull requests in.
                </p>
                <div>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => void loadRepositories()}
                    disabled={loading}
                  >
                    {loading ? "Reaching GitHub..." : "Choose a repository"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="field-hint m-0">
              Patchlet needs one repository to read for evidence and to open issues and draft pull
              requests in. Link your GitHub account to choose it.
            </p>
            <div>
              <a className="primary-action" href="/api/github/connect">
                <GithubGlyph />
                Connect GitHub
              </a>
            </div>
          </div>
        )}
      </section>

      <aside className="panel">
        <div className="panel__head">
          <h2>What happens here</h2>
        </div>
        <ul className="grid gap-3 text-[0.9rem] leading-relaxed text-muted">
          <li>The repository check reads the file tree and the best matching files, never writes.</li>
          <li>When a feature is missing, the issue is filed against this repository.</li>
          <li>The change is drafted on a branch and opened as a draft pull request.</li>
          <li>Nothing merges until a developer approves it on the Activity page.</li>
        </ul>
      </aside>
    </div>
  );
}

/** The linked account, or the honest statement that the server credential is what is in use. */
function Identity({
  login,
  avatar,
  unlinking,
  onUnlink,
}: {
  login: string | null;
  avatar: string | null;
  unlinking: boolean;
  onUnlink: () => void;
}) {
  if (!login) {
    return (
      <div className="github-identity">
        <span className="github-identity__avatar grid place-items-center">
          <GithubGlyph />
        </span>
        <span className="grid">
          <span className="github-identity__login">Patchlet</span>
          <span className="github-identity__source">Connected through the server credential</span>
        </span>
      </div>
    );
  }

  return (
    <div className="github-identity">
      {avatar ? (
        <Image
          className="github-identity__avatar"
          src={avatar}
          alt=""
          width={34}
          height={34}
          unoptimized
        />
      ) : (
        <span className="github-identity__avatar grid place-items-center">
          <GithubGlyph />
        </span>
      )}
      <span className="grid">
        <a
          className="github-identity__login"
          href={`https://github.com/${login}`}
          target="_blank"
          rel="noreferrer"
        >
          @{login}
        </a>
        <span className="github-identity__source">Connected through this GitHub account</span>
      </span>
      <span className="github-identity__actions">
        <button type="button" className="link-button" onClick={onUnlink} disabled={unlinking}>
          {unlinking ? "Unlinking..." : "Unlink"}
        </button>
      </span>
    </div>
  );
}

function BoundRepository({
  fullName,
  defaultBranch,
  onChange,
}: {
  fullName: string;
  defaultBranch: string;
  onChange: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--accent-soft)] px-4 py-3">
        <GithubGlyph />
        <a
          className="ext-link text-[1rem]"
          href={`https://github.com/${fullName}`}
          target="_blank"
          rel="noreferrer"
        >
          {fullName}
        </a>
        <span className="outcome-badge is-muted">{defaultBranch}</span>
      </div>
      <p className="field-hint m-0">
        Patchlet opens issues and draft pull requests here. Choosing another repository points every
        future run at it instead.
      </p>
      <div>
        <button type="button" className="secondary-action" onClick={onChange}>
          Choose another repository
        </button>
      </div>
    </div>
  );
}

function RepositoryPicker({
  repositories,
  total,
  search,
  savingFullName,
  onSearch,
  onPick,
}: {
  repositories: Repository[];
  total: number;
  search: string;
  savingFullName: string | null;
  onSearch: (value: string) => void;
  onPick: (repository: Repository) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="field-label" htmlFor="repository-search">
          Search your repositories
        </label>
        <input
          id="repository-search"
          className="field-input"
          type="search"
          value={search}
          placeholder="owner/name"
          autoComplete="off"
          onChange={(event) => onSearch(event.target.value)}
        />
        <p className="field-hint">
          {total} {total === 1 ? "repository" : "repositories"} reachable with the connected credential.
        </p>
      </div>

      {repositories.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">Nothing matches</p>
          <p className="empty-state__text">
            No repository in the connected account matches that search.
          </p>
        </div>
      ) : (
        <ul className="record-list max-h-[420px] overflow-y-auto pr-1">
          {repositories.map((repository) => (
            <li key={repository.id}>
              <button
                type="button"
                className="record-card"
                disabled={savingFullName !== null}
                onClick={() => onPick(repository)}
              >
                <div className="record-card__top">
                  <span className="record-card__summary font-semibold">{repository.fullName}</span>
                  {repository.private ? (
                    <span className="outcome-badge is-muted">private</span>
                  ) : null}
                  <span className="record-card__time">
                    {savingFullName === repository.fullName ? "Binding..." : repository.defaultBranch}
                  </span>
                </div>
                {repository.description ? (
                  <p className="record-card__line">{repository.description}</p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GithubGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
