import Image from "next/image";
import Link from "next/link";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
};

export function AuthSplitLayout({
  children,
  welcomeTitle = "Welcome back",
  welcomeSubtitle = "Nice to see you again",
}: AuthSplitLayoutProps) {
  return (
    <main className="grid min-h-svh bg-[#f4f7fb] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#04356f_0%,#054da1_48%,#1a7ad4_100%)] lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.85) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.85) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full border border-white/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-10 top-24 h-28 w-28 rounded-full border border-white/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-[140%] rounded-[100%] bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-[-10%] h-72 w-[150%] rounded-[100%] bg-[#032c5c]/35"
        />

        <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12 xl:px-16">
          <Link href="/" className="inline-flex w-fit items-center gap-3">
            <Image
              src="/assets/logo-full.png"
              alt="Life Skills Innovation Hub"
              width={168}
              height={48}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>

          <div className="max-w-lg pb-16">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/70">
              {welcomeSubtitle}
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
              {welcomeTitle}
            </h1>
            <div className="mt-5 h-1 w-16 rounded-full bg-white/80" />
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/75">
              Practical courses with modules, lessons, and quizzes — built for real skills with Life
              Skills Innovation Hub.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}
