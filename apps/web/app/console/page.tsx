import { Glass } from "@/components/Glass";
import { PageHeader } from "@/components/PageHeader";

export default function ConsoleOverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="The project this console manages, its embed snippet, and what the agent has been doing."
      />
      <Glass>
        <p className="text-[var(--muted)]">
          Project details, the embed snippet, document and conversation counts, and the worker&apos;s
          status appear here.
        </p>
      </Glass>
    </>
  );
}
