"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminSettingsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user?.role !== "super_admin") {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  if (!ready || user?.role !== "super_admin") {
    return <p className="text-sm text-[var(--muted)]">Super Admin only…</p>;
  }

  return (
    <div className="surface max-w-xl space-y-4 p-6">
      <h2 className="font-display text-2xl">System settings</h2>
      <p className="text-sm text-[var(--muted)]">
        Reserved for Super Admin. Currency, site name, and payment provider config will
        connect to Laravel later.
      </p>
      <label className="block space-y-2 text-sm">
        <span>Site name</span>
        <input className="input" defaultValue="LSIH Learn" disabled />
      </label>
      <label className="block space-y-2 text-sm">
        <span>Currency</span>
        <input className="input" defaultValue="USD" disabled />
      </label>
    </div>
  );
}
