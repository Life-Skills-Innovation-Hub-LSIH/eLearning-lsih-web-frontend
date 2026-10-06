import Link from "next/link";
import { BookOpen, HeartHandshake, Users } from "lucide-react";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(135deg,#04356f_0%,#054da1_55%,#0a6bc7_100%)]">
        <div className="container-page relative py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
            About LSIH
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Life Skills Innovation Hub
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            We help learners across Cambodia build practical skills through structured online
            courses — modules, lessons, quizzes, and certificates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses" className="btn btn-accent">
              Browse courses
            </Link>
            <Link
              href="/register"
              className="btn border border-white/25 bg-white/10 !text-white hover:bg-white/18"
            >
              Join as a student
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-5 py-12 md:grid-cols-3 sm:py-14">
        {[
          {
            icon: HeartHandshake,
            title: "Our mission",
            text: "Make practical, career-ready learning accessible for students and young professionals.",
          },
          {
            icon: BookOpen,
            title: "How we teach",
            text: "Short lessons, clear modules, quizzes that check understanding, and certificates that prove completion.",
          },
          {
            icon: Users,
            title: "Who we serve",
            text: "Learners preparing for exams, building life skills, growing as leaders, and getting career-ready.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--brand-soft)]/50">
        <div className="container-page grid gap-10 py-14 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
              Learning that fits real goals
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              From Bac II preparation to leadership and workplace skills, LSIH courses are designed
              to be clear, practical, and completable online — with progress tracking every step.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-[var(--ink)]">
            {[
              "Published courses with video and PDF lessons",
              "Quizzes with pass scores",
              "Student dashboard and progress tracking",
              "Certificate PDF when you finish",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-14 text-center sm:py-16">
        <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
          Ready to start?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--muted)]">
          Create an account, explore the catalog, and ask an admin to activate your subscription.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="btn btn-primary">
            Register now
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
