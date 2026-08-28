"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

type Props = {
  children: React.ReactNode;
};

export function RequireAdmin({ children }: Props) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
