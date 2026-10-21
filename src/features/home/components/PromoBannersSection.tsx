"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type PromoBanner = {
  id: string;
  theme: "dark" | "light" | "brand" | "accent";
  kicker?: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  image: string;
};

const banners: PromoBanner[] = [
  {
    id: "ai",
    theme: "dark",
    kicker: "Skills for the future",
    title: "Learn AI for the work you do",
    description:
      "Practical AI courses with modules, quizzes, and certificates — built for every role.",
    cta: "Explore AI courses",
    href: "/courses",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "security",
    theme: "brand",
    kicker: "Cybersecurity",
    title: "Protect systems. Build confidence.",
    description:
      "Start from security foundations and earn a certificate when you finish.",
    cta: "Browse security",
    href: "/courses",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "cloud",
    theme: "light",
    kicker: "Cloud & IT",
    title: "Get job-ready with cloud fundamentals",
    description:
      "Learn cloud models, networking basics, and IT support paths step by step.",
    cta: "Get started",
    href: "/courses",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "subscribe",
    theme: "accent",
    kicker: "Subscription",
    title: "Unlock full access with a plan",
    description:
      "Enroll in courses, track progress, and download certificates with an active subscription.",
    cta: "View plans",
    href: "/register",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
];

const themeClass: Record<PromoBanner["theme"], string> = {
  dark: "bg-[#121212] text-white",
  brand: "bg-[var(--brand)] text-white",
  light: "bg-[#f3f6f9] text-[var(--ink)] border border-[var(--line)]",
  accent: "bg-[linear-gradient(135deg,#043d80,#054da1_55%,#0a6bc7)] text-white",
};

const ctaClass: Record<PromoBanner["theme"], string> = {
  dark: "bg-white !text-[#054da1] hover:bg-white/95",
  brand: "bg-white !text-[#054da1] hover:bg-white/95",
  light: "bg-[#054da1] !text-white hover:bg-[#043d80]",
  accent: "bg-[#f05a25] !text-white hover:bg-[#d64c1a]",
};

export function PromoBannersSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-promo-card]");
    const width = card?.offsetWidth ?? 320;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (width + gap));
    setActive(Math.max(0, Math.min(banners.length - 1, index)));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncActive, { passive: true });
    return () => el.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  function scrollByCard(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-promo-card]");
    const amount = (card?.offsetWidth ?? 320) + 16;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  function goTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-promo-card]");
    const amount = (card?.offsetWidth ?? 320) + 16;
    el.scrollTo({ left: index * amount, behavior: "smooth" });
  }

  return (
    <section className="container-page pb-12 pt-6 sm:pb-14 sm:pt-7">
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((banner) => (
            <article
              key={banner.id}
              data-promo-card
              className={`relative grid min-h-[240px] w-[min(100%,560px)] shrink-0 snap-start grid-cols-1 overflow-hidden rounded-2xl sm:min-h-[260px] sm:w-[min(92%,640px)] sm:grid-cols-[1.15fr_0.85fr] ${themeClass[banner.theme]}`}
            >
              <div className="relative z-10 flex flex-col justify-center gap-3 p-6 sm:p-8">
                {banner.kicker ? (
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                      banner.theme === "light" ? "text-[var(--brand)]" : "text-white/75"
                    }`}
                  >
                    {banner.kicker}
                  </p>
                ) : null}
                <h3 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                  {banner.title}
                </h3>
                <p
                  className={`max-w-md text-sm leading-relaxed ${
                    banner.theme === "light" ? "text-[var(--muted)]" : "text-white/80"
                  }`}
                >
                  {banner.description}
                </p>
                <Link
                  href={banner.href || "/courses"}
                  className={`mt-2 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold no-underline transition ${ctaClass[banner.theme]}`}
                >
                  <span>{banner.cta}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>

              <div className="relative hidden min-h-[200px] sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className={`absolute inset-0 ${
                    banner.theme === "light"
                      ? "bg-gradient-to-l from-transparent via-[#f3f6f9]/40 to-[#f3f6f9]"
                      : banner.theme === "dark"
                        ? "bg-gradient-to-l from-transparent via-black/40 to-[#121212]"
                        : "bg-gradient-to-l from-transparent via-[var(--brand)]/35 to-[var(--brand)]"
                  }`}
                />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2" role="tablist" aria-label="Promo banners">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`Show banner ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2.5 rounded-full transition ${
                  active === index
                    ? "w-7 bg-[var(--brand)]"
                    : "w-2.5 bg-[var(--line)] hover:bg-[var(--muted)]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => scrollByCard(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-sm transition hover:border-[var(--brand)]/30 hover:text-[var(--brand)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => scrollByCard(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-sm transition hover:border-[var(--brand)]/30 hover:text-[var(--brand)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
