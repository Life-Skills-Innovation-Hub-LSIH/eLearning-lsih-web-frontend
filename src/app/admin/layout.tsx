"use client";

import { RequireAuth } from "@/features/auth";
import { AdminProviders, AdminShell } from "@/features/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminProviders>
        <AdminShell>{children}</AdminShell>
      </AdminProviders>
    </RequireAuth>
  );
}
