"use client";

export default function AdminDashboardPage() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow)]">
      <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">Admin</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        You are logged in. Admin features will be added here later.
      </p>
      <div className="mt-6 min-h-24 rounded-xl border border-dashed border-[var(--line)]" />
    </div>
  );
}
