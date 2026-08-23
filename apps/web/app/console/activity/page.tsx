import { Glass } from "@/components/Glass";
import { PageHeader } from "@/components/PageHeader";

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity"
        description="Every check, decision and artefact, streamed live from the agent and the worker."
      />
      <Glass>
        <p className="text-[var(--muted)]">
          Recent conversations and escalations, and the live trace for the selected one, appear here.
        </p>
      </Glass>
    </>
  );
}
