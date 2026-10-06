export const metadata = { title: "Terms" };

const sections = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing Life Skills Innovation Hub (LSIH) websites and learning services, you agree to these Terms of Use. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Accounts",
    body: "You are responsible for keeping your login credentials secure. Student accounts may require an active subscription (managed by LSIH administrators) before enrolling in courses.",
  },
  {
    title: "3. Course access",
    body: "Published courses may be browsed publicly. Lesson content, quizzes, progress tracking, and certificates are available only to enrolled students with valid access.",
  },
  {
    title: "4. Acceptable use",
    body: "Do not share account access, attempt to disrupt the service, upload harmful content, or misuse certificates. LSIH may suspend accounts that violate these rules.",
  },
  {
    title: "5. Intellectual property",
    body: "Course materials, branding, and platform content belong to LSIH or its licensors. You may use materials only for personal learning unless written permission is given.",
  },
  {
    title: "6. Certificates",
    body: "Certificates confirm course completion under LSIH rules (lessons completed and quizzes passed). Misrepresentation of certificates is prohibited.",
  },
  {
    title: "7. Changes",
    body: "We may update these terms from time to time. Continued use of the platform after changes means you accept the updated terms.",
  },
  {
    title: "8. Contact",
    body: "Questions about these terms: lifeskillsinnovationhub@lsih.com",
  },
];

export default function TermsPage() {
  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[linear-gradient(180deg,#e8f1fb_0%,#ffffff_100%)]">
        <div className="container-page py-12 sm:py-14">
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
            Last updated: October 2026. These terms govern use of the LSIH e-learning platform.
          </p>
        </div>
      </section>
      <section className="container-page max-w-3xl space-y-8 py-10 sm:py-14">
        {sections.map((section) => (
          <article key={section.title}>
            <h2 className="font-display text-xl font-semibold text-[var(--ink)]">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-[var(--muted)]">{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
