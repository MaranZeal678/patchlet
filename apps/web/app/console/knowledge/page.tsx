import { PageHeader } from "@/components/PageHeader";
import { KnowledgeConsole } from "@/components/console/knowledge/KnowledgeConsole";
import { loadProject } from "@/lib/console/project";
import { DOCUMENT_COLUMNS, toConsoleDocument } from "@/lib/ingest/run";
import type { ConsoleDocument } from "@/lib/ingest/types";
import { serviceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const project = await loadProject();
  const documents = project ? await loadDocuments(project.id) : [];

  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title="What the agent answers from"
        description="Add a handbook, a documentation site or a note. Patchlet reads it, splits it into passages and remembers how well it read each one."
      />

      {project ? (
        <KnowledgeConsole initialDocuments={documents} siteUrl={project.siteUrl} />
      ) : (
        <div className="notice is-error">
          No project has been seeded yet. Run the migration and the seed script, then reload.
        </div>
      )}
    </>
  );
}

async function loadDocuments(projectId: string): Promise<ConsoleDocument[]> {
  const { data } = await serviceClient()
    .from("document")
    .select(DOCUMENT_COLUMNS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toConsoleDocument);
}
