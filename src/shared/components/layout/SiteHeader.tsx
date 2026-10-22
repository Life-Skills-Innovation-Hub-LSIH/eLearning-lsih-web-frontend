"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { homePathForRole } from "@/features/auth";
import { HeaderSearchDiscover } from "@/shared/components/layout/HeaderSearchDiscover";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { useLocale } from "@/shared/i18n/locale-context";
import { EXPLORE_CATEGORIES, trackHref } from "@/shared/lib/learning-tracks";

export function SiteHeader() {
  const { user, logout, ready } = useAuth();
  const { locale, toggleLocale, t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleLogout() {
    setProfileOpen(false);
    setMenuOpen(false);
    logout();
    router.push("/login");
  }

  const isAuthed = Boolean(ready && user);
  const accountHref = user?.role === "student" ? "/account" : "/admin/account";
  const homeHref = user ? homePathForRole(user.role) : "/";
  const headerNavItemClass =
    "site-header-nav-item inline-flex h-9 items-center rounded-[var(--radius)] px-3 text-sm font-medium transition hover:bg-[var(--brand-soft)]";

  return (
    <header className="sticky top-0 z-50 rounded-b-[28px] border-b border-[var(--line)]/80 bg-white shadow-[0_8px_24px_rgba(5,77,161,0.08)]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-5 lg:gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <Image
              src="/assets/logo-full.png"
              alt="Life Skills Innovation Hub"
              width={140}
              height={40}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div className="relative">
              <button
                type="button"
                className={`${headerNavItemClass} gap-1.5`}
                onMouseEnter={() => setExploreOpen(true)}
                onFocus={() => setExploreOpen(true)}
                aria-expanded={exploreOpen}
              >
                {t("nav.explore")}
                <ChevronDown className={`h-4 w-4 transition ${exploreOpen ? "rotate-180" : ""}`} />
              </button>
              {exploreOpen ? (
                <div
                  className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(96vw,1120px)] min-h-[420px] rounded-2xl border border-[var(--line)] bg-white px-8 py-8 shadow-[var(--shadow-hover)]"
                  onMouseLeave={() => setExploreOpen(false)}
                >
                  <div className="grid min-h-[300px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {EXPLORE_CATEGORIES.map((group) => (
                      <div key={group.track}>
                        <Link
                          href={trackHref(group.track)}
                          className="mb-4 block text-base font-semibold text-[var(--brand)] hover:underline"
                          onClick={() => setExploreOpen(false)}
                        >
                          {locale === "km" ? group.titleKm : group.titleEn}
                        </Link>
                        <ul className="space-y-3 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
                          {group.items.map((item) => (
                            <li key={item.q}>
                              <Link
                                href={trackHref(group.track, item.q)}
                                className="transition hover:text-[var(--brand)]"
                                onClick={() => setExploreOpen(false)}
                              >
                                {locale === "km" ? item.labelKm : item.labelEn}
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
                      {t("nav.viewAllCourses")}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            {isAuthed ? (
              <Link
                href={user?.role === "student" ? "/my-courses" : homeHref}
                className={`${headerNavItemClass}${
                  pathname === "/my-courses" || pathname.startsWith("/my-courses/")
                    ? " is-active"
                    : ""
                }`}
              >
                {t("nav.myCourses")}
              </Link>
            ) : null}
          </div>

          <HeaderSearchDiscover className="hidden lg:block" />
        </div>

        <nav className="hidden items-center gap-3 lg:flex">
          {isAuthed && user ? (
            <>
              <Link
                href="/help"
                className="inline-flex size-11 items-center justify-center rounded-full text-[var(--ink)]/70 transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                aria-label={t("nav.help")}
                title={t("nav.help")}
              >
                <CircleHelp className="h-6 w-6" strokeWidth={1.75} />
              </Link>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full transition hover:bg-[var(--brand-soft)]"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((open) => !open)}
                >
                  <UserAvatar
                    name={user.name}
                    firstName={user.firstName}
                    avatarUrl={user.avatar}
                    size="sm"
                    title={user.name}
                  />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-[var(--line)] bg-white py-2 shadow-[var(--shadow-hover)]">
                    <div className="border-b border-[var(--line)] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">{user.name}</p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {user.role === "student" ? "Student" : "Admin"}
                      </p>
                    </div>
                    <div className="py-1">
                      {user.role === "student" ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                            onClick={() => setProfileOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-[var(--brand)]" />
                            Dashboard
                          </Link>
                          <Link
                            href="/my-courses"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                            onClick={() => setProfileOpen(false)}
                          >
                            <BookOpen className="h-4 w-4 text-[var(--brand)]" />
                            My learning
                          </Link>
                          <Link
                            href="/account"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                            onClick={() => setProfileOpen(false)}
                          >
                            <UserRound className="h-4 w-4 text-[var(--brand)]" />
                            Account
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href={homeHref}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                            onClick={() => setProfileOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-[var(--brand)]" />
                            Admin
                          </Link>
                          <Link
                            href={accountHref}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                            onClick={() => setProfileOpen(false)}
                          >
                            <UserRound className="h-4 w-4 text-[var(--brand)]" />
                            Account
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t border-[var(--line)] py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      >
                        <LogOut className="h-4 w-4 text-[var(--brand)]" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="site-header-nav-item inline-flex h-9 items-center rounded-[var(--radius)] px-3 text-sm font-medium transition hover:bg-[var(--brand-soft)]"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--brand)] bg-white px-4 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]"
              >
                {t("nav.joinFree")}
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
            aria-label="Toggle language"
            title={locale === "km" ? "English" : "ខ្មែរ"}
          >
            <Languages className="h-4 w-4" />
            {locale === "km" ? "EN" : "ខ្មែរ"}
          </button>
        </nav>

        {isAuthed && user ? (
          <div className="flex items-center gap-1 lg:hidden">
            <Link
              href="/help"
              className="inline-flex size-11 items-center justify-center rounded-full text-[var(--ink)]/70 transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
              aria-label="Help"
            >
              <CircleHelp className="h-6 w-6" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full transition hover:bg-[var(--brand-soft)]"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <UserAvatar
                name={user.name}
                firstName={user.firstName}
                avatarUrl={user.avatar}
                size="sm"
                title={user.name}
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-[var(--radius)] p-2 text-[var(--brand)] transition hover:bg-[var(--brand-soft)] lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {menuOpen ? (
        <div className="absolute left-0 right-0 top-full border-b border-[var(--line)] bg-white px-4 py-5 shadow-lg lg:hidden">
          <div className="space-y-1">
            {isAuthed && user ? (
              <>
                {user.role === "student" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/my-courses"
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      My learning
                    </Link>
                    <Link
                      href="/account"
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={homeHref}
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                    <Link
                      href={accountHref}
                      className="block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Account
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-[var(--radius)] px-3 py-2.5 text-left text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2 px-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleLocale();
                    setMenuOpen(false);
                  }}
                  className="btn btn-secondary w-full !py-2.5 text-sm"
                >
                  {locale === "km" ? "English" : "ភាសាខ្មែរ"}
                </button>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="btn btn-secondary flex-1 !py-2.5 text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--brand)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.joinFree")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
