"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  }

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[linear-gradient(180deg,#e8f1fb_0%,#ffffff_100%)]">
        <div className="container-page py-12 sm:py-14">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            Contact & support
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Questions about courses, subscription, or your account? Send us a message.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <div className="space-y-4">
          <div className="surface flex gap-3 p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
            <div>
              <p className="font-semibold text-[var(--ink)]">Location</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Phnom Penh, Cambodia</p>
            </div>
          </div>
          <div className="surface flex gap-3 p-5">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
            <div>
              <p className="font-semibold text-[var(--ink)]">Email</p>
              <a
                href="mailto:lifeskillsinnovationhub@lsih.com"
                className="mt-1 block text-sm text-[var(--brand)] hover:underline"
              >
                lifeskillsinnovationhub@lsih.com
              </a>
            </div>
          </div>
          <div className="surface flex gap-3 p-5">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
            <div>
              <p className="font-semibold text-[var(--ink)]">Phone</p>
              <p className="mt-1 text-sm text-[var(--muted)]">012 345 678</p>
            </div>
          </div>
        </div>

        <div className="surface p-6 sm:p-8">
          {sent ? (
            <div className="space-y-4 text-center py-8">
              <h2 className="font-display text-2xl text-[var(--ink)]">Message received</h2>
              <p className="text-sm text-[var(--muted)]">
                Thanks for reaching out. Our team will get back to you soon.
              </p>
              <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-sm font-semibold text-[var(--ink)]">
                  Your name
                </label>
                <input
                  id="contact-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-sm font-semibold text-[var(--ink)]">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-sm font-semibold text-[var(--ink)]">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className="input min-h-36"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  required
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={submitting}>
                {submitting ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
