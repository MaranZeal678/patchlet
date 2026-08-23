import { PageHeader } from "@/components/PageHeader";
import { RepositoryConnect } from "@/components/console/RepositoryConnect";
import { loadProject } from "@/lib/console/project";

export const dynamic = "force-dynamic";

export default async function RepositoryPage() {
  const project = await loadProject();

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
        />
      ) : (
        <div className="notice is-error">
          No project has been seeded yet. Run the migration and the seed script, then reload.
        </div>
      )}
    </>
  );
}
