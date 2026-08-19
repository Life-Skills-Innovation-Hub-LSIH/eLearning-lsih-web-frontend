"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { staticUsers } from "@/lib/auth/static-users";

export default function AdminAdminsPage() {
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

  const admins = staticUsers.filter((item) => item.role !== "student");

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Only Super Admin can manage admin accounts. Create/delete APIs come later.
      </p>
      <div className="surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3 font-medium">{admin.name}</td>
                <td className="px-4 py-3">{admin.email}</td>
                <td className="px-4 py-3">{admin.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
