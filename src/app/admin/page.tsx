"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { AdminPageLayout } from "@/features/admin/components/AdminPageLayout";
import { Card, CardContent } from "@/features/admin/shadcn";

export default function AdminDashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === "admin") {
      router.replace("/admin/users");
    }
  }, [ready, user, router]);

  if (user?.role === "admin") {
    return null;
  }

  return (
    <AdminPageLayout
      title="Admin workspace"
      description="More features will appear here when they are ready."
    >
      <Card className="py-0">
        <CardContent className="px-8 py-10 text-center text-sm text-muted-foreground">
          No admin pages are available for your role yet.
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
