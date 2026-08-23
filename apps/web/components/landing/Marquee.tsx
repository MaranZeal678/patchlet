const ITEMS = ["Mistral", "GitHub", "Supabase", "Vercel", "Next.js", "Postgres", "OCR", "Codestral"];

/** The stack strip under the hero. Purely typographic, scrolling slowly behind a soft mask. */
export function Marquee() {
  return (
    <section aria-label="Stack" className="overflow-hidden border-y border-line/60 bg-surface/40 py-7">
      <div className="mx-auto flex max-w-7xl items-center gap-10 px-6 lg:px-10">
        <span className="hidden text-[10px] font-semibold tracking-[0.24em] whitespace-nowrap text-ink/45 uppercase sm:block">
          Built on
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-14">
            {[...ITEMS, ...ITEMS].map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="font-display text-2xl whitespace-nowrap text-ink/35 italic"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
