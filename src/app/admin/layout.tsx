"use client";

import { RequireAuth } from "@/features/auth";
import { AdminProviders, AdminShell } from "@/features/admin";
import { AdminThemeProvider } from "@/features/admin/components/AdminThemeProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <RequireAuth roles={["admin"]}>
        <AdminProviders>
          <AdminShell>{children}</AdminShell>
        </AdminProviders>
      </RequireAuth>
    </AdminThemeProvider>
  );
}
