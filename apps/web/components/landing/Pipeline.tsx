import { Eyebrow } from "./Eyebrow";

const NODES = [
  { label: "Widget on your page", tone: "neutral" },
  { label: "Three checks", tone: "neutral" },
  { label: "Verdict", tone: "accent" },
  { label: "Issue and draft PR", tone: "neutral" },
  { label: "Your approval", tone: "soft" },
] as const;

export function Pipeline() {
  return (
    <section id="pipeline" className="border-t border-line/60 bg-surface/30 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-14 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Eyebrow>The pipeline</Eyebrow>
            <h2 className="mt-5 font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Every step is on the <br />
              <span className="font-medium text-accent italic">record.</span>
            </h2>
          </div>
          <p className="leading-relaxed text-ink/60 lg:col-span-4">
            One trace per conversation. Every probe, verdict, model call and artefact is written
            down as it happens, and streamed to the console live.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[32px] border border-line/70 bg-panel p-8 shadow-[0_24px_50px_-30px_rgba(23,32,28,0.4)] lg:p-12">
          <div className="flex min-w-[820px] items-center gap-4 lg:gap-5">
            {NODES.map((node, index) => {
              const tone =
                node.tone === "accent"
                  ? "bg-accent-deep text-panel border-accent-deep shadow-lg shadow-accent/20"
                  : node.tone === "soft"
                    ? "bg-accent-soft text-accent-deep border-accent/30"
                    : "bg-surface border-line";
              return (
                <div key={node.label} className="flex flex-shrink-0 items-center gap-4 lg:gap-5">
                  <div className={`rounded-2xl border px-6 py-5 text-sm font-medium whitespace-nowrap ${tone}`}>
                    {node.label}
                  </div>
                  {index < NODES.length - 1 && (
                    <svg width="64" height="14" viewBox="0 0 64 14" aria-hidden className="flex-shrink-0">
                      <line
                        x1="0"
                        y1="7"
                        x2="58"
                        y2="7"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        className="animate-dash"
                      />
                      <path d="M58 3 L64 7 L58 11 Z" fill="var(--accent)" opacity="0.7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 border-t border-line/60 pt-8 sm:grid-cols-3">
            <Stat value="3" label="Checks before a verdict" />
            <Stat value="0" label="Selectors sent to the model" />
            <Stat value="1" label="Human approval to merge" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs tracking-[0.18em] text-ink/50 uppercase">{label}</p>
    </div>
  );
}
