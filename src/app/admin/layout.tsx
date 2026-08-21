"use client";

import { RequireAuth } from "@/features/auth";
import { AdminShell } from "@/features/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
