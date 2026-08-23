import Link from "next/link";
import { Glass } from "@/components/Glass";

const STEPS = [
  {
    title: "It answers from your documentation",
    body: "Upload a handbook, a PDF or a URL. Answers are grounded in what you actually wrote, and scanned pages are discounted by how well they read.",
  },
  {
    title: "It shows people the real controls",
    body: "The widget scans the page the user is looking at and hands the agent opaque handles, never selectors. A plan that names a control which is not there is thrown away.",
  },
  {
    title: "It builds what is missing",
    body: "Three checks have to agree a feature does not exist. Then it files the issue, drafts the change, opens a draft pull request, and waits for a human.",
  },
];

const SNIPPET = `<script src="https://patchlet-v2.vercel.app/widget.js"
        data-key="pk_your_project_key" async></script>`;

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <header className="mb-16 max-w-3xl">
        <p className="mb-5 inline-flex items-center rounded-full border border-[var(--hairline)] bg-white/60 px-3 py-1 text-[13px] text-[var(--muted)]">
          Support that closes the loop
        </p>
        <h1 className="text-[46px] leading-[1.08] tracking-[-0.03em]">
          Support that fixes the product
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
          Patchlet answers from your documentation, guides people on the page they are already
          looking at, and when a feature does not exist it opens the pull request that adds it.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/console" className="btn btn-primary">
            Open the console
          </Link>
          <Link href="/console/activity" className="btn">
            See a live trace
          </Link>
        </div>
      </header>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Glass key={step.title} className="flex flex-col">
            <span className="mono mb-4 text-[var(--accent)]">0{index + 1}</span>
            {/* A fixed heading block keeps the three bodies on the same line when a title wraps. */}
            <h2 className="mb-2 min-h-[3.25rem] text-[17px]">{step.title}</h2>
            <p className="text-[14px] leading-relaxed text-[var(--muted)]">{step.body}</p>
          </Glass>
        ))}
      </div>

      <Glass tone="strong">
        <h2 className="mb-1 text-[17px]">Add it to your app</h2>
        <p className="mb-4 text-[14px] text-[var(--muted)]">
          One script tag. The key identifies your project and nothing else, so it is safe in your
          page source.
        </p>
        <pre className="mono overflow-x-auto rounded-[8px] border border-[var(--hairline)] bg-white/70 p-4 text-[var(--ink)]">
          <code>{SNIPPET}</code>
        </pre>
      </Glass>

      <footer className="mt-16 border-t border-[var(--hairline)] pt-6 text-[13px] text-[var(--faint)]">
        Patchlet
      </footer>
    </div>
  );
}
