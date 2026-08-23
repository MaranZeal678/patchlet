type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** There is one accent in this system, so at most one primary button per view. */
  variant?: "default" | "primary";
};

export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
  const tone = variant === "primary" ? "btn btn-primary" : "btn";
  return <button className={`${tone} ${className}`} {...props} />;
}
