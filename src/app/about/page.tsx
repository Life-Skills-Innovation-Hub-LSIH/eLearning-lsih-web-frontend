export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page py-14 sm:py-16">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            About us
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Life Skills Innovation Hub helps learners build practical skills through
            structured courses: modules, video and PDF lessons, module quizzes, and
            end-of-course assessments.
          </p>
        </div>
      </section>
      <section className="container-page grid gap-5 py-12 md:grid-cols-3 sm:py-14">
        {[
          ["Our mission", "Make practical learning accessible for teams and students."],
          ["How we teach", "Short lessons, clear modules, and quizzes that check understanding."],
          ["Who we serve", "Learners, admins, and organizations building life and work skills."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
            <h2 className="font-display text-lg font-semibold text-[var(--ink)]">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
