"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react";
import { useAuth } from "@/features/auth";
import { formatRoleLabel } from "../lib/user-store";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  superAdminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/admin/users", label: "Manage Users", icon: Users, superAdminOnly: true },
];

const SIDEBAR_KEY = "lsih_admin_sidebar_collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }

  const visibleNav = navItems.filter(
    (item) => !item.superAdminOnly || user?.role === "super_admin",
  );

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = (user?.name ?? "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex min-h-screen bg-[#eef1f6]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0f2744] text-white transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div className={`border-b border-white/10 ${collapsed ? "px-2 py-4" : "px-5 py-5"}`}>
          {collapsed ? (
            <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image
                src="/assets/logo-full.png"
                alt="LSIH"
                width={40}
                height={40}
                className="h-7 w-7 object-contain"
              />
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-white px-3 py-2.5">
                <Image
                  src="/assets/logo-full.png"
                  alt="LSIH"
                  width={180}
                  height={52}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Admin System
              </p>
            </>
          )}
        </div>

        <nav className={`flex-1 space-y-1 py-4 ${collapsed ? "px-2" : "px-3"}`}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-lg text-sm font-medium transition ${
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className={`border-t border-white/10 ${collapsed ? "px-2 py-3" : "px-4 py-4"}`}>
          {collapsed ? (
            <div
              title={user?.name}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold"
            >
              {initials || "A"}
            </div>
          ) : (
            <>
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-white/60">
                {user ? formatRoleLabel(user.role) : ""}
              </p>
            </>
          )}
        </div>
      </aside>

      <div
        className={`flex min-h-screen flex-1 flex-col transition-[padding] duration-200 ${
          collapsed ? "pl-[72px]" : "pl-64"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#d8dee8] bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d8dee8] text-[var(--ink)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
            <p className="truncate text-sm font-medium text-[var(--ink)]">
              Life Skills Innovation Hub · Management System
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
