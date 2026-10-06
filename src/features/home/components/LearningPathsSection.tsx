import Link from "next/link";
import { Briefcase, Compass, GraduationCap, Sparkles } from "lucide-react";

const paths = [
  {
    icon: GraduationCap,
    title: "ប្រឡងបាក់ឌុប",
    subtitle: "Bac II prep",
    text: "Math, Khmer, science, history, and English exam tracks.",
  },
  {
    icon: Sparkles,
    title: "ជំនាញ",
    subtitle: "Life skills",
    text: "Problem-solving, money skills, time management, and confidence.",
  },
  {
    icon: Compass,
    title: "ភាពជាអ្នកដឹកនាំ",
    subtitle: "Leadership",
    text: "Public speaking, teamwork, projects, and values-based leadership.",
  },
  {
    icon: Briefcase,
    title: "ត្រៀមសម្រាប់ការងារ",
    subtitle: "Career ready",
    text: "CV writing, interviews, workplace communication, and digital literacy.",
  },
];

export function LearningPathsSection() {
  return (
    <section className="container-page py-14 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            Learning paths
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Choose a direction that matches your goals — then open the full course catalog.
          </p>
        </div>
        <Link href="/courses" className="text-sm font-semibold text-[var(--brand)] hover:underline">
          View all courses →
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path) => {
          const Icon = path.icon;
          return (
            <Link
              key={path.title}
              href="/courses"
              className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-[var(--shadow-hover)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)] text-white transition group-hover:bg-[var(--accent-brand)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
                {path.title}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">
                {path.subtitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{path.text}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
