const testimonials = [
  {
    name: "Sokha M.",
    avatar: "https://i.pravatar.cc/120?img=32",
    quote:
      "LSIH’s clear modules and quizzes made it possible for me to build real skills while balancing work and family.",
  },
  {
    name: "Rithy C.",
    avatar: "https://i.pravatar.cc/120?img=11",
    quote:
      "The structured path rebuilt my confidence. It wasn’t only about learning — it was about believing I could finish and earn a certificate.",
  },
  {
    name: "Dara L.",
    avatar: "https://i.pravatar.cc/120?img=5",
    quote:
      "I now feel more prepared for IT support roles, and I’ve already started applying what I learned with my team.",
  },
  {
    name: "Mey S.",
    avatar: "https://i.pravatar.cc/120?img=47",
    quote:
      "Learning with LSIH expanded my skills with practical lessons, quizzes, and a certificate I can share with employers.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-y bg-white">
      <div className="container-page">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
          Why people choose Life Skills Innovation Hub?
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <p className="font-semibold text-[var(--ink)]">{item.name}</p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                “{item.quote}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
