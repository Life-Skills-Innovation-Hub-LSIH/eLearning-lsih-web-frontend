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
            បណ្តុះបណ្តាលជំនាញជីវិត ភាពជាអ្នកដឹកនាំ និងអាជីពជាក់ស្តែងសម្រាប់អ្នកសិក្សាទូទាំងកម្ពុជា។
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            ការសិក្សា
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--ink)]/80">
            <li>
              <Link href="/courses" className="transition hover:text-[var(--brand)]">
                វគ្គសិក្សាទាំងអស់
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition hover:text-[var(--brand)]">
                ផ្ទាំងគ្រប់គ្រងសិស្ស
              </Link>
            </li>
            <li>
              <Link href="/my-courses" className="transition hover:text-[var(--brand)]">
                វគ្គសិក្សារខ្ញុំ
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition hover:text-[var(--brand)]">
                បង្កើតគណនី
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            អំពីយើង
          </h3>
          <ul className="space-y-2.5 text-sm text-[var(--ink)]/80">
            <li>
              <Link href="/about" className="transition hover:text-[var(--brand)]">
                អំពីយើង
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-[var(--brand)]">
                ទំនាក់ទំនង និងជំនួយ
              </Link>
            </li>
            <li>
              <Link href="/help" className="transition hover:text-[var(--brand)]">
                មជ្ឈមណ្ឌលជំនួយ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-[var(--brand)]">
                ឯកជនភាព
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-[var(--brand)]">
                លក្ខខណ្ឌ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            ទំនាក់ទំនង
          </h3>
          <div className="space-y-2.5 text-sm leading-relaxed text-[var(--ink)]/80">
            <p>ភ្នំពេញ កម្ពុជា</p>
            <p>
              <a
                href="mailto:lifeskillsinnovationhub@lsih.com"
                className="transition hover:text-[var(--brand)]"
              >
                lifeskillsinnovationhub@lsih.com
              </a>
            </p>
            <p>០១២ ៣៤៥ ៦៧៨</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Life Skills Innovation Hub (LSIH)</p>
          <p className="text-xs sm:text-sm">បង្កើតសម្រាប់ការរៀនជាក់ស្តែង ត្រៀមអាជីព</p>
        </div>
      </div>
    </footer>
  );
}
