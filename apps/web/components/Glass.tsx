type GlassProps = {
  children: React.ReactNode;
  /** `strong` is for panels that sit over busy content and need to stay readable. */
  tone?: "default" | "strong";
  className?: string;
};

/** The one panel primitive. Everything on a page sits in one of these. */
export function Glass({ children, tone = "default", className = "" }: GlassProps) {
  const base = tone === "strong" ? "glass-strong" : "glass";
  return <section className={`${base} p-6 ${className}`}>{children}</section>;
}
