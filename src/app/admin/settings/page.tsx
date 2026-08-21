"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

export default function AdminSettingsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user?.role !== "super_admin") {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  if (!ready || user?.role !== "super_admin") {
    return <p className="text-sm text-[var(--muted)]">Checking access…</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Settings</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Site configuration</p>
      </div>

      <div className="max-w-xl space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <label className="block space-y-2 text-sm">
          <span className="font-medium text-[var(--ink)]">Site name</span>
          <input className="input" defaultValue="Life Skills Innovation Hub" disabled />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium text-[var(--ink)]">Currency</span>
          <input className="input" defaultValue="USD" disabled />
        </label>
      </div>
    </div>
  );
}
