"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Label,
  Switch,
} from "@/features/admin/shadcn";
import { formatRoleLabel } from "../lib/user-store";
import { useAdminTheme } from "./AdminThemeProvider";

export function AdminProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useAdminTheme();

  const profileName = user?.name ?? "User";
  const username = user?.username ?? "user";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
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

        <div
          className="flex cursor-default items-center justify-between gap-3 px-2 py-2"
          onClick={(event) => event.preventDefault()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex min-w-0 items-center gap-2">
            {isDark ? (
              <Moon className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <Sun className="size-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <Label htmlFor="admin-dark-mode" className="cursor-pointer text-sm font-medium">
                Dark mode
              </Label>
              <p className="text-xs text-muted-foreground">{isDark ? "On" : "Off"}</p>
            </div>
          </div>
          <Switch
            id="admin-dark-mode"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

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
