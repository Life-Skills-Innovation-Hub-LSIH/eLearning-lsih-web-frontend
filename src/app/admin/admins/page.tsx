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
    return <p className="text-sm text-[var(--muted)]">Checking access…</p>;
  }

  const admins = staticUsers.filter((item) => item.role !== "student");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Admins</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{admins.length} admin accounts</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-[var(--line)]">
                <td className="px-5 py-4 font-medium text-[var(--ink)]">{admin.name}</td>
                <td className="px-5 py-4 text-[var(--muted)]">{admin.email}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand)]">
                    {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
