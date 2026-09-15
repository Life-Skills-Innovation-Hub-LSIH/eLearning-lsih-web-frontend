"use client";

import { PageLoader } from "@/shared/components/ui/PageLoader";

export default function AdminLoading() {
  return <PageLoader label="Loading admin…" className="min-h-[70vh] w-full" />;
}
