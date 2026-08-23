import { ActivityConsole } from "@/components/console/ActivityConsole";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="The live trace"
        description="Every check, decision and artefact, streamed from the agent and the worker as it happens."
      />
      <ActivityConsole />
    </>
  );
}
