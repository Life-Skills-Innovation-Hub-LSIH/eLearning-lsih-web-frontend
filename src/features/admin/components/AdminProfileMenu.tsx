"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/admin/shadcn";
import { formatRoleLabel } from "../lib/user-store";

export function AdminProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const profileName = user?.name ?? "User";
  const username = user?.username ?? "user";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserAvatar
          name={profileName}
          firstName={user.firstName}
          avatarUrl={user.avatar}
          size="sm"
        />
        <span className="hidden max-w-[160px] truncate text-sm font-medium sm:inline">
          {profileName}
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={profileName}
              firstName={user.firstName}
              avatarUrl={user.avatar}
              size="lg"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profileName}</p>
              <p className="truncate text-sm text-muted-foreground">@{username}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatRoleLabel(user.role)}</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/admin/account" />}>
            <UserRound />
            Your Account
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
