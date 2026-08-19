"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

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
    user?.role === "super_admin"
      ? [
          { href: "/admin/admins", label: "Admins" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : [];

  return (
    <nav className="flex flex-wrap gap-2">
      {[...links, ...extra].map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              active
                ? "bg-[var(--brand)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--ink)] hover:text-[var(--brand)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
