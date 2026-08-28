"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth";
import { Button, Card, CardContent, Skeleton } from "@/features/admin/shadcn";
import { fetchUser } from "../api/users-api";
import { UserForm } from "./UserForm";
import type { ManagedUser } from "@/shared/types";

type Props = {
  userId: string;
};

function EditUserSkeleton() {
  return (
    <div className="admin-page space-y-6">
      <div className="space-y-3 border-b pb-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <div className="space-y-6">
          {[1, 2, 3].map((section) => (
            <Card key={section} className="gap-0 overflow-hidden py-0">
              <div className="border-b bg-muted/40 px-6 py-4">
                <Skeleton className="h-5 w-40" />
              </div>
              <CardContent className="space-y-5 py-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function EditUserForm({ userId }: Props) {
  const { token } = useAuth();
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again to edit this user.");
      return;
    }

    setLoading(true);
    fetchUser(token, userId)
      .then(setUser)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load user.");
      })
      .finally(() => setLoading(false));
  }, [token, userId]);

  if (loading) {
    return <EditUserSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="admin-page">
        <Card className="py-0">
          <CardContent className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-destructive">{error || "User not found."}</p>
            <Button className="mt-4" variant="outline" render={<Link href="/admin/users" />}>
              Return to user list
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <UserForm mode="edit" initialUser={user} />;
}
