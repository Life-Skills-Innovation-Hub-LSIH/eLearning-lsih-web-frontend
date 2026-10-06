"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-courses", label: "My courses" },
  { href: "/courses", label: "Browse" },
  { href: "/account", label: "Account" },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[var(--line)] pb-4">
      {items.map((item) => {
        const active =
          item.href === "/courses"
            ? pathname.startsWith("/courses")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "bg-white text-[var(--ink)]/75 ring-1 ring-[var(--line)] hover:text-[var(--brand)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
