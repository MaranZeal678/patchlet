type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, id, className = "", ...props }: InputProps) {
  if (!label) return <input id={id} className={`input ${className}`} {...props} />;

  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--muted)]">{label}</span>
      <input id={id} className={`input ${className}`} {...props} />
    </label>
  );
}
