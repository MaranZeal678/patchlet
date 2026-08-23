import { Glass } from "@/components/Glass";
import { PageHeader } from "@/components/PageHeader";

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        title="Knowledge"
        description="What the agent can answer from. Upload a document, paste text, or point at a URL."
      />
      <Glass>
        <p className="text-[var(--muted)]">
          The source list, ingest status, page and chunk counts, and mean OCR confidence appear here.
        </p>
      </Glass>
    </>
  );
}
