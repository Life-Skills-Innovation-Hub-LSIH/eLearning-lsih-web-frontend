import { Layers3, ShieldCheck, Target } from "lucide-react";

const reasons = [
  {
    icon: Layers3,
    title: "Structured courses",
    text: "Every course follows modules → lessons → quizzes, so progress is clear and measurable.",
  },
  {
    icon: Target,
    title: "Practical skills",
    text: "Built for exams, life skills, leadership, and career readiness — not theory only.",
  },
  {
    icon: ShieldCheck,
    title: "Verified completion",
    text: "Pass every quiz and unlock a downloadable certificate when you finish.",
  },
];

export function WhyLsihSection() {
  return (
    <section className="bg-white">
      <div className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            Why Life Skills Innovation Hub
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            A focused e-learning experience for learners across Cambodia.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div key={reason.title} className="rounded-2xl border border-white/80 bg-white p-6 shadow-[var(--shadow)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{reason.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
