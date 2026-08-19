"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminNav } from "@/components/admin/AdminNav";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            {user?.role === "super_admin" ? "Super Admin" : "Admin"}
          </p>
          <h1 className="mt-1 font-display text-3xl text-[var(--ink)]">
            {user?.name}
          </h1>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
