import { Glass } from "@/components/Glass";
import { PageHeader } from "@/components/PageHeader";

export default function RepositoryPage() {
  return (
    <>
      <PageHeader
        title="Repository"
        description="Where the agent looks for evidence, and where it opens issues and draft pull requests."
      />
      <Glass>
        <p className="text-[var(--muted)]">
          The repository connection form and its validation result appear here.
        </p>
      </Glass>
    </>
  );
}
