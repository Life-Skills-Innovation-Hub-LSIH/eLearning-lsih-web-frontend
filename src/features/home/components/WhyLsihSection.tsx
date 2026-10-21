import { Layers3, ShieldCheck, Target } from "lucide-react";

const reasons = [
  {
    icon: Layers3,
    title: "វគ្គសិក្សាមានរចនាសម្ព័ន្ធ",
    text: "វគ្គនីមួយៗមានម៉ូឌុល → មេរៀន → សំណួរសាកល្បង ដើម្បីឲ្យវឌ្ឍនភាពច្បាស់ និងអាចវាស់បាន។",
  },
  {
    icon: Target,
    title: "ជំនាញជាក់ស្តែង",
    text: "បង្កើតសម្រាប់ប្រឡង ជំនាញជីវិត ភាពជាអ្នកដឹកនាំ និងត្រៀមអាជីព — មិនមែនតែទ្រឹស្តីទេ។",
  },
  {
    icon: ShieldCheck,
    title: "បញ្ចប់ដោយមានការផ្ទៀងផ្ទាត់",
    text: "ប្រឡងឲ្យជាប់គ្រប់សំណួរ រួចទាញវិញ្ញាបនបត្រពេលបញ្ចប់។",
  },
];

export function WhyLsihSection() {
  return (
    <section className="bg-white">
      <div className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            ហេតុអ្វីជ្រើស Life Skills Innovation Hub
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            បទពិសោធន៍សិក្សាអនឡាញផ្តោតសម្រាប់អ្នកសិក្សាទូទាំងកម្ពុជា។
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
