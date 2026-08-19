import { Suspense } from "react";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="container-page py-12">Loading courses…</div>}>{children}</Suspense>;
}
