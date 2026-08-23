import { PageHeader } from "@/components/PageHeader";
import { RepositoryConnect } from "@/components/console/RepositoryConnect";
import { loadProject } from "@/lib/console/project";
import { githubOauthApp } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** What came back on the query string after a round trip to GitHub. */
const LINK_MESSAGES: Record<string, string> = {
  linked: "",
  denied: "The GitHub authorisation was cancelled.",
  state: "That link attempt expired. Start it again.",
  failed: "GitHub did not complete the link. Try again.",
  unavailable: "GitHub linking is not configured on this deployment.",
  unseeded: "No project has been seeded yet.",
};

export default async function RepositoryPage({ searchParams }: Props) {
  const [project, params] = await Promise.all([loadProject(), searchParams]);
  const outcome = typeof params.github === "string" ? params.github : "";

  return (
    <>
      <PageHeader
        eyebrow="Repository"
        title="Where Patchlet does the work"
        description="The repository the agent reads for evidence, and where it files issues and opens draft pull requests."
      />
      {project ? (
        <RepositoryConnect
          initialRepoFullName={project.repoFullName}
          initialDefaultBranch={project.repoDefaultBranch}
          githubLogin={project.githubLogin}
          githubAvatar={project.githubAvatar}
          oauthAvailable={githubOauthApp() !== null}
          linkError={LINK_MESSAGES[outcome] ?? ""}
        />
      ) : (
        <div className="notice is-error">
          No project has been seeded yet. Run the migration and the seed script, then reload.
        </div>
      )}
    </>
  );
}
