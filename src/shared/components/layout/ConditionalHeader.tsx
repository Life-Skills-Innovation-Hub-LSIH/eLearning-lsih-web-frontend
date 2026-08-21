"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/shared/components/layout/SiteHeader";

export function ConditionalHeader() {
  const pathname = usePathname();
  const hideHeader =
    pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register";

  if (hideHeader) return null;
  return <SiteHeader />;
}
