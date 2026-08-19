"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function ConditionalHeader() {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/admin");

  if (hideHeader) return null;
  return <SiteHeader />;
}
