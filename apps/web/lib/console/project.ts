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
};

const COLUMNS =
  "id, slug, name, embed_key, site_url, repo_full_name, repo_default_branch, settings, created_at";

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
  };
}

/** Loads the seeded project, or null when the database has not been seeded yet. */
export async function loadProject(): Promise<ConsoleProject | null> {
  const { data } = await serviceClient()
    .from("project")
    .select(COLUMNS)
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
