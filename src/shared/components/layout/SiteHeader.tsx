"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/features/auth";
import { homePathForRole } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";

const categories = [
  {
    title: "ប្រឡងបាក់ឌុប",
    items: [
      "មុខវិជ្ជា គណិតវិទ្យា",
      "មុខវិជ្ជា ភាសាខ្មែរ",
      "មុខវិជ្ជា គីមីវិទ្យា",
      "មុខវិជ្ជា រូបវិទ្យា",
      "មុខវិជ្ជា ជីវវិទ្យា",
      "មុខវិជ្ជា ប្រវត្តិវិទ្យា",
      "មុខវិជ្ជា អង់គ្លេស",
    ],
  },
  {
    title: "ជំនាញ",
    items: [
      "ការគិត និងដោះស្រាយបញ្ហា",
      "ចំណេះដឹងហិរញ្ញវត្ថុ",
      "ការគ្រប់គ្រងពេលវេលា",
      "ដំណោះស្រាយជម្លោះ និងបញ្ញាស្មារតីអារម្មណ៍",
      "ទំនុកចិត្តខ្លួនឯង និងរៀបចំគោលដៅជីវិត",
    ],
  },
  {
    title: "ភាពជាអ្នកដឹកនាំ",
    items: [
      "ការនិយាយសាធារណៈ",
      "ការងារក្រុម និងគ្រប់គ្រងគម្រោង",
      "ភាពជាអ្នកដឹកនាំផ្ទាល់ខ្លួន",
      "ដឹកនាំដោយការយល់ចិត្ត និងតម្លៃ",
    ],
  },
  {
    title: "ត្រៀមសម្រាប់ការងារ",
    items: [
      "ការសរសេរប្រវត្តិរូបសង្ខេប",
      "ត្រៀមក្នុងកិច្ចសម្ភាសន៍",
      "កន្លែងប្រាស្រ័យទាក់ទង",
      "អក្ខរកម្មឌីជីថល (email, MS Office, etc.)",
    ],
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
              រុករក
              <ChevronDown className={`h-4 w-4 transition ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen ? (
              <div
                className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(96vw,1120px)] min-h-[420px] rounded-2xl border border-[var(--line)] bg-white px-8 py-8 shadow-[var(--shadow-hover)]"
                onMouseLeave={() => setExploreOpen(false)}
              >
                <div className="grid min-h-[300px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {categories.map((group) => (
                    <div key={group.title}>
                      <p className="mb-4 text-base font-semibold text-[var(--brand)]">
                        {group.title}
                      </p>
                      <ul className="space-y-3 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
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
                <div className="mt-8 border-t border-[var(--line)] pt-5 text-center">
                  <Link
                    href="/courses"
                    className="text-sm font-semibold text-[var(--brand)] hover:underline"
                    onClick={() => setExploreOpen(false)}
                  >
                    មើលវគ្គសិក្សាទាំងអស់ →
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
              placeholder="ស្វែងរកវគ្គសិក្សា"
              className="h-9 w-[220px] rounded-full border border-[var(--line)] bg-[var(--background)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white xl:w-[260px]"
            />
          </form>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/" className={linkClass("/")}>
            ទំព័រដើម
          </Link>
          <Link href="/courses" className={linkClass("/courses")}>
            វគ្គសិក្សា
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            អំពីយើង
          </Link>
          <Link href="/contact" className={linkClass("/contact")}>
            ទំនាក់ទំនង
          </Link>

          {ready && user ? (
            <>
              <UserAvatar
                name={user.name}
                firstName={user.firstName}
                avatarUrl={user.avatar}
                size="sm"
                title={user.name}
                className="hidden sm:inline-flex"
              />
              {user.role === "student" ? (
                <>
                  <Link href="/dashboard" className={linkClass("/dashboard")}>
                    ផ្ទាំងគ្រប់គ្រង
                  </Link>
                  <Link href="/my-courses" className={linkClass("/my-courses")}>
                    ការរៀនរបស់ខ្ញុំ
                  </Link>
                  <Link href="/account" className={linkClass("/account")}>
                    គណនី
                  </Link>
                </>
              ) : (
                <Link href={homePathForRole(user.role)} className={linkClass(homePathForRole(user.role))}>
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[var(--line)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)]"
              >
                ចាកចេញ
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                ចូលគណនី
              </Link>
              <Link href="/register" className="btn btn-primary !rounded-full !px-4 !py-2 text-sm">
                ចុះឈ្មោះ
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
              { href: "/", label: "ទំព័រដើម" },
              { href: "/courses", label: "វគ្គសិក្សា" },
              { href: "/about", label: "អំពីយើង" },
              { href: "/contact", label: "ទំនាក់ទំនង" },
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
                {user.role === "student" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      ផ្ទាំងគ្រប់គ្រង
                    </Link>
                    <Link
                      href="/my-courses"
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      ការរៀនរបស់ខ្ញុំ
                    </Link>
                    <Link
                      href="/account"
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      គណនី
                    </Link>
                  </>
                ) : (
                  <Link
                    href={homePathForRole(user.role)}
                    className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full rounded-[var(--radius)] px-3 py-2.5 text-left text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                >
                  ចាកចេញ
                </button>
              </>
            ) : (
              <div className="mt-3 flex gap-2 px-1">
                <Link
                  href="/login"
                  className="btn btn-secondary flex-1 !py-2.5 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  ចូលគណនី
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary flex-1 !py-2.5 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  ចុះឈ្មោះ
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
