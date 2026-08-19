export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="container-page max-w-3xl py-12">
      <h1 className="font-display text-4xl text-[var(--ink)]">Contact</h1>
      <p className="mt-4 leading-8 text-[var(--muted)]">
        Demo contact page. Wire this to the Laravel API contact endpoint in a later phase.
      </p>
      <div className="surface mt-8 space-y-4 p-6">
        <input className="input" placeholder="Your name" disabled />
        <input className="input" placeholder="Email" disabled />
        <textarea className="input min-h-32" placeholder="Message" disabled />
        <button className="btn btn-primary opacity-60" disabled>
          Send (coming soon)
        </button>
      </div>
    </main>
  );
}
