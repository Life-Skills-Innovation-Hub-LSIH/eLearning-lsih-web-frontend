"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

export default function AdminDashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === "super_admin") {
      router.replace("/admin/users");
    }
  }, [ready, user, router]);

  if (user?.role === "super_admin") {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#d8dee8] bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-[var(--muted)]">
        Admin workspace. Additional features will appear here based on your role.
      </p>
    </div>
  );
}
