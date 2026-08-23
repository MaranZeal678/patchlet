import { appUrl, projectSlug } from "@/lib/env";
import { serviceClient } from "@/lib/supabase";

/** The single project this console manages, as the console pages consume it. */
export type ConsoleProject = {
  id: string;
  slug: string;
  name: string;
  embedKey: string;
  siteUrl: string | null;
  repoFullName: string | null;
  repoDefaultBranch: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
  /** The linked GitHub account. The access token itself never leaves the server. */
  githubLogin: string | null;
  githubAvatar: string | null;
};

export const PROJECT_COLUMNS =
  "id, slug, name, embed_key, site_url, repo_full_name, repo_default_branch, settings, created_at, github_login, github_avatar";

function toProject(row: Record<string, unknown>): ConsoleProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    embedKey: String(row.embed_key),
    siteUrl: row.site_url === null ? null : String(row.site_url),
    repoFullName: row.repo_full_name === null ? null : String(row.repo_full_name),
    repoDefaultBranch: row.repo_default_branch === null ? null : String(row.repo_default_branch),
    settings: (row.settings ?? {}) as Record<string, unknown>,
    createdAt: String(row.created_at),
    githubLogin: row.github_login ? String(row.github_login) : null,
    githubAvatar: row.github_avatar ? String(row.github_avatar) : null,
  };
}

/** Loads the seeded project, or null when the database has not been seeded yet. */
export async function loadProject(): Promise<ConsoleProject | null> {
  const { data } = await serviceClient()
    .from("project")
    .select(PROJECT_COLUMNS)
    .eq("slug", projectSlug())
    .maybeSingle();
  return data ? toProject(data as Record<string, unknown>) : null;
}

/** The script tag a customer pastes into their own page. */
export function embedSnippet(embedKey: string): string {
  return `<script src="${appUrl()}/widget.js"\n        data-key="${embedKey}" async></script>`;
}

export function widgetUrl(): string {
  return `${appUrl()}/widget.js`;
}

export { toProject };
