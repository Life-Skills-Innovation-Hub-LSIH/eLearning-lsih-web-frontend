"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { AdminPageLayout } from "@/features/admin/components/AdminPageLayout";
import { AdminFormSection } from "@/features/admin/components/AdminFormFields";
import { Card, CardContent } from "@/features/admin/shadcn";
import { AvatarUploadField } from "@/shared/components/ui/AvatarUploadField";
import { Settings, UserRound } from "lucide-react";

export default function AdminSettingsPage() {
  const { user, token, ready, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user?.role !== "admin") {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  if (!ready || user?.role !== "admin" || !token) {
    return <p className="text-sm text-muted-foreground">Checking access…</p>;
  }

  return (
    <AdminPageLayout
      title="Settings"
      description="Manage platform configuration and administrator preferences."
    >
      <AdminFormSection icon={UserRound} title="Profile" description="Your account photo.">
        <AvatarUploadField
          token={token}
          name={user.name}
          firstName={user.firstName}
          avatarUrl={user.avatar}
          isSelf
          onChange={() => {}}
          onUploaded={() => {
            void refreshUser();
          }}
        />
      </AdminFormSection>

      <AdminFormSection
        icon={Settings}
        title="General"
        description="Basic site information and billing defaults."
      >
        <div className="divide-y rounded-lg border">
          {[
            ["Site name", "Life Skills Innovation Hub"],
            ["Currency", "USD"],
            ["Student payment duration", "1 year (fixed)"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-2 px-4 py-4 sm:grid-cols-[200px_1fr] sm:items-center"
            >
              <p className="text-sm font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </AdminFormSection>

      <Card className="border-dashed bg-muted/20 py-0 shadow-none">
        <CardContent className="px-5 py-4 text-sm text-muted-foreground">
          More platform settings will be added here as features are built.
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
