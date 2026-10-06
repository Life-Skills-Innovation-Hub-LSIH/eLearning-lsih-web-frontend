export const metadata = { title: "Privacy" };

const sections = [
  {
    title: "1. Information we collect",
    body: "We collect account details such as name, username, email, and learning activity (enrollments, lesson progress, quiz attempts, certificates). Technical logs may include IP address and device information for security.",
  },
  {
    title: "2. How we use information",
    body: "We use your data to operate the platform, manage subscriptions, track learning progress, issue certificates, improve the service, and communicate about your account.",
  },
  {
    title: "3. Sharing",
    body: "We do not sell personal data. Information may be shared with authorized administrators, service providers who help run the platform, or when required by law.",
  },
  {
    title: "4. Data retention",
    body: "We keep account and learning records while your account is active and as needed for education records, legal obligations, or dispute resolution.",
  },
  {
    title: "5. Security",
    body: "We use reasonable technical and organizational measures to protect your information. No online service is 100% secure; please use a strong password.",
  },
  {
    title: "6. Your choices",
    body: "You may request account updates or ask about your learning data by contacting support. Some records may be retained when legally required.",
  },
  {
    title: "7. Children",
    body: "If learners under the local age of digital consent use the platform, a parent/guardian or school administrator should supervise account setup as required.",
  },
  {
    title: "8. Contact",
    body: "Privacy questions: lifeskillsinnovationhub@lsih.com",
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[linear-gradient(180deg,#e8f1fb_0%,#ffffff_100%)]">
        <div className="container-page py-12 sm:py-14">
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
            Last updated: October 2026. How Life Skills Innovation Hub handles learner data.
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
