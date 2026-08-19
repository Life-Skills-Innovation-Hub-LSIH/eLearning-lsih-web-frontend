"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <div className="container-page py-8">{children}</div>
    </RequireAuth>
  );
}
