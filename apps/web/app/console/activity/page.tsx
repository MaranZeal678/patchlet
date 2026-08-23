import { ActivityConsole } from "@/components/console/ActivityConsole";
import { PageHeader } from "@/components/PageHeader";
import { loadProject } from "@/lib/console/project";
import { loadConversationSummaries } from "@/lib/console/conversations";
import { loadEscalations } from "@/lib/console/records";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const project = await loadProject();
  // The first paint carries the two lists already, so the demo never opens on a spinner.
  const [escalations, conversations] = project
    ? await Promise.all([
        loadEscalations(project.id),
        loadConversationSummaries(project.id, { limit: 40 }),
      ])
    : [[], []];

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="The live trace"
        description="Every check, decision and artefact, streamed from the agent and the worker as it happens."
      />
      <ActivityConsole initialEscalations={escalations} initialConversations={conversations} />
    </>
  );
}
