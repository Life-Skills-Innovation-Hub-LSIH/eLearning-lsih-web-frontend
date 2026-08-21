import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Image
            src="/assets/logo-full.png"
            alt="Life Skills Innovation Hub"
            width={160}
            height={48}
            className="h-11 w-auto object-contain"
          />
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Practical life skills, leadership, and career training for learners across Cambodia.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Learning
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--ink)]/80">
            <li>
              <Link href="/courses" className="transition hover:text-[var(--brand)]">
                All courses
              </Link>
            </li>
            <li>
              <Link href="/courses" className="transition hover:text-[var(--brand)]">
                Skills
              </Link>
            </li>
            <li>
              <Link href="/courses" className="transition hover:text-[var(--brand)]">
                Leadership
              </Link>
            </li>
            <li>
              <Link href="/courses" className="transition hover:text-[var(--brand)]">
                Career Ready
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Company
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--ink)]/80">
            <li>
              <Link href="/about" className="transition hover:text-[var(--brand)]">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-[var(--brand)]">
                Contact & support
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-[var(--brand)]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-[var(--brand)]">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Contact
          </h3>
          <div className="space-y-2.5 text-sm leading-relaxed text-[var(--ink)]/80">
            <p>Phnom Penh, Cambodia</p>
            <p>
              <a href="mailto:lifeskillsinnovationhub@lsih.com" className="transition hover:text-[var(--brand)]">
                lifeskillsinnovationhub@lsih.com
              </a>
            </p>
            <p>012 345 678</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Life Skills Innovation Hub (LSIH)</p>
          <p className="text-xs sm:text-sm">Built for practical, career-ready learning</p>
        </div>
      </div>
    </footer>
  );
}
