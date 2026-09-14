"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { PageLoader } from "@/shared/components/ui/PageLoader";

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
    return <PageLoader label="Checking access…" />;
  }

  return <>{children}</>;
}
