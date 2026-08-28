"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const extra =
    user?.role === "admin"
      ? [
          { href: "/admin/admins", label: "Admins" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : [];

  return (
    <nav className="flex flex-wrap gap-1">
      {[...links, ...extra].map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              active
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--ink)]/70 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
