"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { fetchUser } from "../api/users-api";
import { UserForm } from "./UserForm";
import type { ManagedUser } from "@/shared/types";

type Props = {
  userId: string;
};

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
    return <p className="text-sm text-[var(--muted)]">Loading user…</p>;
  }

  if (error || !user) {
    return <p className="text-sm text-red-600">{error || "User not found."}</p>;
  }

  return <UserForm mode="edit" initialUser={user} />;
}
