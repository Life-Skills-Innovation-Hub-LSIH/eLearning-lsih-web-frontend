import Link from "next/link";
import { Award, BookOpen, ClipboardCheck, UserPlus } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Browse courses",
    text: "Explore published courses by subject, skill, and career path.",
  },
  {
    icon: UserPlus,
    title: "Register & get access",
    text: "Create your student account. An admin activates your subscription.",
  },
  {
    icon: ClipboardCheck,
    title: "Learn & pass quizzes",
    text: "Complete video and PDF lessons, then pass module quizzes.",
  },
  {
    icon: Award,
    title: "Earn a certificate",
    text: "Finish the course and download your certificate PDF.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-y border-[var(--line)] bg-white">
      <div className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            How learning works
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] sm:text-[0.95rem]">
            A clear path from discovery to certificate — built for real progress.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative rounded-2xl border border-[var(--line)] bg-white p-5"
              >
                <span className="absolute top-4 right-4 text-xs font-bold text-[var(--brand)]/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="btn btn-primary">
            Start learning
          </Link>
        </div>
      </div>
    </section>
  );
}
