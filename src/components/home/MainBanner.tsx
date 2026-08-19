import Image from "next/image";
import Link from "next/link";

export function MainBanner() {
  return (
    <section className="relative -mt-16 flex min-h-svh overflow-hidden bg-[linear-gradient(135deg,#04356f_0%,#054da1_42%,#0a6bc7_100%)] pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 85% 40%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(ellipse 45% 40% at 10% 80%, rgba(240,90,37,0.18), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.65) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />

      <div className="container-page relative my-auto grid w-full items-center gap-8 py-16 lg:grid-cols-2 lg:gap-10 lg:py-20">
        <div className="flex flex-col items-start text-left">
          <h1 className="animate-fade-up font-display text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]">
            Life Skills
            <br />
            Innovation Hub
          </h1>
          <p className="animate-fade-up animate-delay-1 mt-4 max-w-lg font-display text-xl font-medium text-white/90 sm:text-2xl">
            Learn without limits
          </p>
          <p className="animate-fade-up animate-delay-2 mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Practical courses with modules, video and PDF lessons, and quizzes — built for real skills.
          </p>
          <div className="animate-fade-up animate-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login" className="btn btn-accent">
              Register now
            </Link>
            <Link
              href="/courses"
              className="btn border border-white/25 bg-white/10 !text-white backdrop-blur-sm hover:bg-white/18 hover:!text-white"
            >
              Browse courses
            </Link>
          </div>
        </div>

        <div className="animate-fade-in relative flex justify-center lg:justify-end">
          <div
            aria-hidden
            className="absolute inset-8 rounded-full bg-white/10 blur-3xl lg:inset-12"
          />
          <Image
            src="/assets/iconMainBanner.png"
            alt="LSIH learning illustration"
            width={556}
            height={513}
            priority
            className="relative h-auto w-full max-w-[300px] scale-x-[-1] drop-shadow-[0_24px_48px_rgba(0,0,0,0.25)] sm:max-w-[420px] lg:max-w-[520px]"
          />
        </div>
      </div>
    </section>
  );
}
