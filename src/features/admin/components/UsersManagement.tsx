"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/shadcn";
import { deleteUserApi, fetchUsers } from "../api/users-api";
import { ActionMenu } from "./ActionMenu";
import { AdminPageLayout } from "./AdminPageLayout";
import { RoleBadge, StatusBadge } from "./RoleBadge";
import { isStudentRole } from "../lib/user-store";
import type { ManagedUser, User } from "@/shared/types";

const roleFilterOptions = [
  { value: "all", label: "All roles" },
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
];

function userDisplayName(user: ManagedUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.username;
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UsersManagement() {
  const router = useRouter();
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [role, setRole] = useState<"all" | User["role"]>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadUsers() {
    if (!token) {
      setLoading(false);
      setLoadError("Please log in again to load users.");
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      const nextUsers = await fetchUsers(token, { role, createdFrom, createdTo });
      setUsers(nextUsers);
      setSelectedIds(new Set());
      setPage(1);
    } catch (error) {
      setUsers([]);
      setLoadError(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, createdFrom, createdTo]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const haystack = [user.firstName, user.lastName, user.username, user.email]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const allOnPageSelected =
    pagedUsers.length > 0 && pagedUsers.every((user) => selectedIds.has(user.id));

  async function onDelete(user: ManagedUser) {
    if (!token) {
      setActionError("Please log in again to delete a user.");
      return;
    }
    if (currentUser?.id === user.id) {
      setActionError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${userDisplayName(user)}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    setActionError("");
    try {
      await deleteUserApi(token, user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message);
      } else {
        setActionError(error instanceof Error ? error.message : "Failed to delete user.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pagedUsers.forEach((user) => next.delete(user.id));
      } else {
        pagedUsers.forEach((user) => next.add(user.id));
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const hasFilters = role !== "all" || createdFrom || createdTo;

  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === "student");
    return {
      total: users.length,
      students: students.length,
      admins: users.filter((u) => u.role === "admin").length,
      paid: students.filter((u) => u.status === "paid").length,
    };
  }, [users]);

  return (
    <AdminPageLayout
      title="Users"
      description="Manage student accounts, admin access, and subscription status."
      actions={
        <Button render={<Link href="/admin/users/create" />}>
          <Plus />
          Add user
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: loading ? "—" : stats.total },
          { label: "Students", value: loading ? "—" : stats.students },
          { label: "Admins", value: loading ? "—" : stats.admins },
          { label: "Paid students", value: loading ? "—" : stats.paid },
        ].map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-5 py-3.5">
          <p className="text-sm font-semibold">
            Directory{" "}
            <span className="font-normal text-muted-foreground">
              {loading ? "…" : `${filteredUsers.length} records`}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="admin-form-input w-56 bg-background pl-9"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button
              type="button"
              variant={showFilters || hasFilters ? "default" : "outline"}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter />
              Filters
            </Button>
          </div>
        </div>

        {showFilters ? (
          <div className="grid gap-3 border-b bg-muted/20 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "all" | User["role"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="createdFrom">Created from</Label>
              <Input
                id="createdFrom"
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="createdTo">Created to</Label>
              <Input
                id="createdTo"
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!hasFilters}
                onClick={() => {
                  setRole("all");
                  setCreatedFrom("");
                  setCreatedTo("");
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        ) : null}

        {actionError ? (
          <div className="border-b bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12 px-4">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  className="size-4 rounded border-input"
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead className="px-4">User name</TableHead>
              <TableHead className="px-4">Access</TableHead>
              <TableHead className="px-4">Date added</TableHead>
              <TableHead className="w-12 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8">
                  <PageLoader compact label="Loading users…" />
                </TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-destructive">
                  {loadError}
                </TableCell>
              </TableRow>
            ) : pagedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  {hasFilters || search ? (
                    "No users match your search or filters."
                  ) : (
                    <>
                      No users yet.{" "}
                      <Link href="/admin/users/create" className="font-semibold text-[#054da1]">
                        Add the first user
                      </Link>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pagedUsers.map((user) => {
                const isSelf = currentUser?.id === user.id;
                const displayName = userDisplayName(user);

                return (
                  <TableRow key={user.id}>
                    <TableCell className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleOne(user.id)}
                        className="size-4 rounded border-input"
                        aria-label={`Select ${displayName}`}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={displayName}
                          firstName={user.firstName}
                          avatarUrl={user.avatar}
                          title={displayName}
                        />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {displayName}
                            {isSelf ? (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (You)
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <RoleBadge role={user.role} />
                        {isStudentRole(user.role) ? <StatusBadge status={user.status} /> : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <ActionMenu
                        items={[
                          {
                            label: "Edit details",
                            onClick: () => router.push(`/admin/users/${user.id}/edit`),
                          },
                          {
                            label: "Delete user",
                            destructive: true,
                            disabled: isSelf || deletingId === user.id,
                            onClick: () => void onDelete(user),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && filteredUsers.length > 0 ? (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "secondary" : "ghost"}
                  size="sm"
                  className="min-w-8"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </AdminPageLayout>
  );
}
