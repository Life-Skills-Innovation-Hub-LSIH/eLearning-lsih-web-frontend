import { Suspense } from "react";
import { PageLoader } from "@/shared/components/ui/PageLoader";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader label="Loading courses…" />}>{children}</Suspense>;
}
