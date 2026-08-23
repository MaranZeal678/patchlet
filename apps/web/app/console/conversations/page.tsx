import { ConversationsConsole } from "@/components/console/ConversationsConsole";
import { PageHeader } from "@/components/PageHeader";
import { loadConversationSummaries, loadOutcomeCounts } from "@/lib/console/conversations";
import { loadProject } from "@/lib/console/project";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const project = await loadProject();
  // The list is already on the first paint, so the page never opens on a spinner.
  const [conversations, counts] = project
    ? await Promise.all([
        loadConversationSummaries(project.id, { limit: 60 }),
        loadOutcomeCounts(project.id),
      ])
    : [[], { all: 0, solved: 0, product_bug: 0, missing_feature: 0, unresolved: 0 }];

  return (
    <>
      <PageHeader
        eyebrow="Observability"
        title="Conversations"
        description="Every question the agent has handled, how it ended, and the guidance it gave."
      />
      <ConversationsConsole
        initialConversations={conversations}
        initialCounts={counts}
        siteUrl={project?.siteUrl ?? null}
      />
    </>
  );
}
