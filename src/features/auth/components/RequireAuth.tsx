"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { homePathForRole } from "../lib/static-users";
import type { User } from "@/shared/types";

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
      router.replace(homePathForRole(user.role));
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
