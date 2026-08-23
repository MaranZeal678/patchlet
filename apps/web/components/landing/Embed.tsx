import { CopyButton } from "@/components/CopyButton";

export function Embed({ snippet }: { snippet: string }) {
  return (
    <section id="embed" className="border-t border-line/60 py-28 lg:py-36">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-accent-deep px-8 py-20 text-panel lg:px-16 lg:py-24">
          <Decoration />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-panel/20 px-3 py-1 text-[11px] tracking-[0.22em] text-panel/80 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              One script tag
            </span>
            <h2 className="mt-7 max-w-2xl font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl">
              Add it to your app in <span className="italic">one line</span>.
            </h2>
            <p className="mt-6 max-w-md text-panel/75">
              The key names your project and nothing else, so it is safe to leave in your page
              source. Everything with a secret in it stays on our side.
            </p>

            <div className="mt-10 overflow-hidden rounded-[14px] border border-panel/15 bg-panel/10">
              <div className="flex items-center justify-between gap-4 border-b border-panel/15 px-4 py-2.5">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-panel/60 uppercase">
                  index.html
                </span>
                <CopyButton
                  value={snippet}
                  label="Copy snippet"
                  className="inline-flex min-h-8 items-center rounded-full border border-panel/25 bg-panel/10 px-3 text-[13px] font-semibold text-panel transition-colors hover:border-panel/50 hover:bg-panel/20"
                />
              </div>
              <pre className="mono overflow-x-auto px-4 py-4 text-left text-panel/90">
                <code>{snippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Decoration() {
  return (
    <>
      <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-64 opacity-[0.09]" aria-hidden>
        <circle cx="100" cy="100" r="90" fill="var(--panel)" />
        <path d="M100 100 L100 10 A90 90 0 0 0 21 70 Z" fill="var(--accent)" opacity="0.4" />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute -top-16 -right-16 w-72 opacity-[0.07]" aria-hidden>
        <circle cx="100" cy="100" r="90" fill="var(--sage)" />
      </svg>
    </>
  );
}
