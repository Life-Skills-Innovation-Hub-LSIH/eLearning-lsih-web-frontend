"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/features/auth";
import { homePathForRole } from "@/features/auth";

const categories = [
  {
    title: "Skills",
    items: ["Problem Solving", "Financial Literacy", "Time Management", "Self Confidence"],
  },
  {
    title: "Leadership",
    items: ["Public Speaking", "Teamwork", "Personal Leadership", "Emotional Leadership"],
  },
  {
    title: "Career Ready",
    items: ["Resume Writing", "Interview Prep", "Networking", "Digital Literacy"],
  },
  {
    title: "Clinical",
    items: ["Infection Control", "Patient Communication", "Triage Basics", "Service Excellence"],
  },
];

export function SiteHeader() {
  const { user, logout, ready } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [search, setSearch] = useState("");

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href
        ? "font-semibold text-[var(--brand)]"
        : "font-medium text-[var(--ink)]/75 hover:text-[var(--brand)]"
    }`;

  return (
    <header className="sticky top-0 z-50 rounded-b-[28px] border-b border-[var(--line)]/80 bg-white/95 shadow-[0_8px_24px_rgba(5,77,161,0.08)] backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-5 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <Image
              src="/assets/logo-full.png"
              alt="Life Skills Innovation Hub"
              width={140}
              height={40}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>

          <div className="relative hidden md:block">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius)] px-3 text-sm font-medium text-[var(--ink)]/80 transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
              onMouseEnter={() => setExploreOpen(true)}
              onFocus={() => setExploreOpen(true)}
              aria-expanded={exploreOpen}
            >
              Explore
              <ChevronDown className={`h-4 w-4 transition ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen ? (
              <div
                className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(90vw,820px)] rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-hover)]"
                onMouseLeave={() => setExploreOpen(false)}
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {categories.map((group) => (
                    <div key={group.title}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        {group.title}
                      </p>
                      <ul className="space-y-2 text-sm text-[var(--ink)]">
                        {group.items.map((item) => (
                          <li key={item}>
                            <Link
                              href="/courses"
                              className="transition hover:text-[var(--brand)]"
                              onClick={() => setExploreOpen(false)}
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-[var(--line)] pt-4 text-center">
                  <Link
                    href="/courses"
                    className="text-sm font-semibold text-[var(--brand)] hover:underline"
                    onClick={() => setExploreOpen(false)}
                  >
                    View all courses →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="relative hidden lg:block"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.href = `/courses?q=${encodeURIComponent(search)}`;
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses"
              className="h-9 w-[220px] rounded-full border border-[var(--line)] bg-[var(--background)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white xl:w-[260px]"
            />
          </form>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/courses" className={linkClass("/courses")}>
            Courses
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            About
          </Link>

          {ready && user ? (
            <>
              <Link href={homePathForRole(user.role)} className={linkClass(homePathForRole(user.role))}>
                {user.role === "student" ? "My Learning" : "Admin"}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[var(--line)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary !rounded-full !px-4 !py-2 text-sm">
                Register
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="rounded-[var(--radius)] p-2 text-[var(--brand)] transition hover:bg-[var(--brand-soft)] lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="absolute left-0 right-0 top-full border-b border-[var(--line)] bg-white px-4 py-5 shadow-lg lg:hidden">
          <div className="space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/courses", label: "Courses" },
              { href: "/about", label: "About" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {ready && user ? (
              <>
                <Link
                  href={homePathForRole(user.role)}
                  className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full rounded-[var(--radius)] px-3 py-2.5 text-left text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-3 flex gap-2 px-1">
                <Link
                  href="/login"
                  className="btn btn-secondary flex-1 !py-2.5 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary flex-1 !py-2.5 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
