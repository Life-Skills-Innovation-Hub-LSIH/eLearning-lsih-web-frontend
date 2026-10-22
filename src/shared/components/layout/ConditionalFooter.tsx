"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/shared/components/layout/SiteFooter";

export function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/my-courses") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/onboarding";

  if (hideFooter) return null;
  return <SiteFooter />;
}
