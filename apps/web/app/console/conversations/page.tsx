/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { redirect } from "next/navigation";
import { ConversationsConsole } from "@/components/console/ConversationsConsole";
import { PageHeader } from "@/components/PageHeader";
import { loadConversationSummaries, loadOutcomeCounts } from "@/lib/console/conversations";
import { currentProjectOrNull } from "@/lib/console/current";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const project = await currentProjectOrNull();
  if (!project) redirect("/signin");
  // The list is already on the first paint, so the page never opens on a spinner.
  const [conversations, counts] = await Promise.all([
    loadConversationSummaries(project.id, { limit: 60 }),
    loadOutcomeCounts(project.id),
  ]);

  return (
    <div className="console-fill">
      <PageHeader
        eyebrow="Observability"
        title="Conversations"
        description="Every question the agent has handled, how it ended, and the guidance it gave."
      />
      <ConversationsConsole
        initialConversations={conversations}
        initialCounts={counts}
        siteUrl={project.siteUrl}
      />
    </div>
  );
}
