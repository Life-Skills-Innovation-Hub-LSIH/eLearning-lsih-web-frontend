type Props = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: Props) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">{label}</span>
          <span className="font-medium text-[var(--ink)]">{safe}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
