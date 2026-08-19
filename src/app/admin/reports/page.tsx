export default function AdminReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Reports</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Learning activity snapshot</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Course completion rate", "62%"],
          ["Average quiz score", "78%"],
          ["Active learners (7d)", "41"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"
          >
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--ink)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
