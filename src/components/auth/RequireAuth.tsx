"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import type { User } from "@/types";

type Props = {
  roles: Array<User["role"]>;
  children: React.ReactNode;
};

export function RequireAuth({ roles, children }: Props) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roles.includes(user.role)) {
      router.replace(user.role === "student" ? "/dashboard" : "/admin");
    }
  }, [ready, user, roles, router]);

  if (!ready || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--muted)]">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
