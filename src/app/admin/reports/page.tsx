export default function AdminReportsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Course completion rate", "62%"],
        ["Average quiz score", "78%"],
        ["Active learners (7d)", "41"],
      ].map(([label, value]) => (
        <div key={label} className="surface p-5">
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p className="mt-2 font-display text-3xl">{value}</p>
        </div>
      ))}
    </div>
  );
}
