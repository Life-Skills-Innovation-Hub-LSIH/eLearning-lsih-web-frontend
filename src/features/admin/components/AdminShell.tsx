"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  BookMarked,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/features/admin/shadcn";
import { AdminProfileMenu } from "./AdminProfileMenu";
import { formatRoleLabel } from "../lib/user-store";
import "../styles/admin-theme.css";

const PIN_KEY = "lsih-admin-sidebar-pinned";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  adminOnly?: boolean;
};

const mainNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/students", label: "Students", icon: GraduationCap, adminOnly: true },
  { href: "/admin/subjects", label: "Subjects", icon: BookMarked, adminOnly: true },
  { href: "/admin/lecturers", label: "Lecturers", icon: UserRound, adminOnly: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, adminOnly: true },
];

const footerNavItems: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function breadcrumbLabel(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/users/create")) return "Add user";
  if (pathname.includes("/content") && pathname.startsWith("/admin/courses")) return "Course content";
  if (pathname.includes("/edit") && pathname.startsWith("/admin/courses")) return "Edit course";
  if (pathname.startsWith("/admin/courses/create")) return "Add course";
  if (pathname.startsWith("/admin/courses")) return "Courses";
  if (pathname.includes("/edit") && pathname.startsWith("/admin/lecturers")) return "Edit lecturer";
  if (pathname.startsWith("/admin/lecturers/create")) return "Add lecturer";
  if (pathname.startsWith("/admin/lecturers")) return "Lecturers";
  if (pathname.includes("/edit") && pathname.startsWith("/admin/subjects")) return "Edit subject";
  if (pathname.startsWith("/admin/subjects/create")) return "Add subject";
  if (pathname.startsWith("/admin/subjects")) return "Subjects";
  if (pathname.includes("/edit")) return "Users";
  if (pathname.startsWith("/admin/account")) return "Your account";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.match(/^\/admin\/students\/[^/]+$/)) return "Student details";
  if (pathname.startsWith("/admin/students")) return "Students";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Dashboard";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(PIN_KEY) === "1";
    setPinned(saved);
    setOpen(saved);
    setReady(true);
  }, []);

  const visibleMainNav = mainNavItems.filter(
    (item) => !item.adminOnly || user?.role === "admin",
  );
  const visibleFooterNav = footerNavItems.filter(
    (item) => !item.adminOnly || user?.role === "admin",
  );

  const profileName = user?.name ?? "User";
  const homeHref = "/admin";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function togglePinned() {
    setPinned((prev) => {
      const next = !prev;
      window.localStorage.setItem(PIN_KEY, next ? "1" : "0");
      setOpen(next);
      return next;
    });
  }

  return (
    <div
      className="flex min-h-svh w-full"
      data-sidebar-pinned={pinned ? "true" : "false"}
      data-sidebar-hover={open && !pinned ? "true" : "false"}
    >
    <SidebarProvider
      className="min-h-svh"
      open={ready ? open : false}
      onOpenChange={(next) => {
        setOpen(next);
        setPinned(next);
        window.localStorage.setItem(PIN_KEY, next ? "1" : "0");
      }}
    >
      <Sidebar
        collapsible="icon"
        className="border-r-0"
        onMouseEnter={() => {
          if (!pinned) setOpen(true);
        }}
        onMouseLeave={() => {
          if (!pinned) setOpen(false);
        }}
      >
        <SidebarHeader className="border-b border-[var(--admin-border)]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="h-10 gap-2.5 px-2 hover:bg-[var(--admin-hover)] group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0"
                render={<Link href={homeHref} />}
                tooltip="LSIH E-Learning Admin"
              >
                <Image
                  src="/assets/logo-full.png"
                  alt="LSIH"
                  width={28}
                  height={28}
                  className="size-7 shrink-0 object-contain"
                />
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-[var(--admin-text)]">LSIH Admin</span>
                  <span className="truncate text-xs text-[var(--admin-subtle)]">
                    E-Learning Platform
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMainNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        tooltip={item.label}
                        className="h-10 gap-2.5"
                      >
                        <Icon className="size-4 shrink-0 stroke-[1.75]" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-[var(--admin-border)]">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleFooterNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        tooltip={item.label}
                        className="h-10 gap-2.5"
                      >
                        <Icon className="size-4 shrink-0 stroke-[1.75]" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip="Log out"
                    className="h-10 gap-2.5"
                  >
                    <LogOut className="size-4 shrink-0 stroke-[1.75]" />
                    <span>Log out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2 bg-[var(--admin-border)]" />

          <div className="flex h-10 items-center gap-2.5 overflow-hidden rounded-xl bg-[var(--admin-brand-soft)] px-2 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <UserAvatar
              name={profileName}
              firstName={user?.firstName}
              avatarUrl={user?.avatar}
              title={profileName}
            />
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-[var(--admin-text)]">{profileName}</p>
              <p className="truncate text-xs text-[var(--admin-subtle)]">
                {user ? formatRoleLabel(user.role) : ""}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="m-0 min-h-svh rounded-none bg-[#f5f7fa] shadow-none">
        <div className="admin-inset flex min-h-svh flex-1 flex-col !rounded-none !border-0 !bg-[#f5f7fa] !shadow-none">
          <header className="admin-inset-header flex h-14 shrink-0 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-ml-1 size-8 text-[var(--admin-muted)] hover:text-[var(--admin-brand)]"
                onClick={togglePinned}
                aria-label={pinned ? "Collapse sidebar" : "Expand sidebar"}
                title={pinned ? "Collapse sidebar" : "Keep sidebar expanded"}
              >
                <PanelLeft className="size-4" />
              </Button>
              <nav className="flex items-center gap-1.5 text-sm text-[var(--admin-muted)]">
                <Link
                  href={homeHref}
                  className="font-medium transition hover:text-[var(--admin-brand)]"
                >
                  Admin
                </Link>
                <ChevronRight className="size-3.5 opacity-50" />
                <span className="font-semibold text-[var(--admin-text)]">
                  {breadcrumbLabel(pathname)}
                </span>
              </nav>
            </div>

            <AdminProfileMenu />
          </header>

          <div className="admin-inset-body">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
