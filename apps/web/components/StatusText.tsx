type StatusTextProps = {
  children: React.ReactNode;
  /** `active` is the only case that takes the accent, and only while something is in flight. */
  tone?: "muted" | "active" | "failed";
};

/**
 * Status is text, not a coloured pill. A dot carries the state at a glance without turning the
 * page into a traffic light.
 */
export function StatusText({ children, tone = "muted" }: StatusTextProps) {
  const dot =
    tone === "active"
      ? "bg-[var(--accent)]"
      : tone === "failed"
        ? "bg-[var(--ink)]"
        : "bg-[var(--faint)]";
  const text = tone === "muted" ? "text-[var(--faint)]" : "text-[var(--muted)]";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${text}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}
