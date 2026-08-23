/** The Patchlet mark: a patch, stitched on. */
export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="9" fill="var(--accent-deep)" />
      <path
        d="M10.5 16.2h11M16 10.7v11"
        fill="none"
        stroke="var(--panel)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeDasharray="3.1 3.1"
      />
    </svg>
  );
}
