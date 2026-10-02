"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, BookMarked, BookOpen, GraduationCap, LogOut, Settings, UserRound, Users } from "lucide-react";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/features/admin/shadcn";
import { AdminProfileMenu } from "./AdminProfileMenu";
import { formatRoleLabel } from "../lib/user-store";
import "../styles/admin-theme.css";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  adminOnly?: boolean;
};

const mainNavItems: NavItem[] = [
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

  const visibleMainNav = mainNavItems.filter(
    (item) => !item.adminOnly || user?.role === "admin",
  );
  const visibleFooterNav = footerNavItems.filter(
    (item) => !item.adminOnly || user?.role === "admin",
  );

  const profileName = user?.name ?? "User";
  const homeHref = user?.role === "admin" ? "/admin/users" : "/admin";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
      <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarHeader className="border-b border-white/8 px-3 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-white/6"
                  render={<Link href={homeHref} />}
                  tooltip="LSIH E-Learning Admin"
                >
                  <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                    <Image
                      src="/assets/logo-full.png"
                      alt="LSIH"
                      width={32}
                      height={32}
                      className="size-6 object-contain"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">LSIH Admin</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      E-Learning Platform
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="px-2 py-3">
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
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
                        >
                          <Icon className="stroke-[1.75]" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/8 px-2 py-3">
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
                        >
                          <Icon className="stroke-[1.75]" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
                      <LogOut className="stroke-[1.75]" />
                      <span>Log out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-2 bg-white/10" />

            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-2 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <UserAvatar
                name={profileName}
                firstName={user?.firstName}
                avatarUrl={user?.avatar}
                title={profileName}
              />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium text-white">{profileName}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {user ? formatRoleLabel(user.role) : ""}
                </p>
              </div>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href={homeHref} className="font-medium transition hover:text-foreground">
                  Admin
                </Link>
                <ChevronRight className="size-3.5 opacity-50" />
                <span className="font-medium text-foreground">{breadcrumbLabel(pathname)}</span>
              </nav>
            </div>

            <AdminProfileMenu />
          </header>

          <div className="flex-1 px-6 py-6 lg:px-8 lg:py-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
  );
}
