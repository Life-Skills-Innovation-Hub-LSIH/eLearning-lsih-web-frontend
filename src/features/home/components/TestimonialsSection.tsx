const testimonials = [
  {
    name: "Sokha M.",
    avatar: "https://i.pravatar.cc/120?img=32",
    quote:
      "ម៉ូឌុល និងសំណួរសាកល្បងច្បាស់លាស់របស់ LSIH ជួយខ្ញុំរៀនជំនាញពិតប្រាកដ ខណៈតុល្យការងារ និងគ្រួសារ។",
  },
  {
    name: "Rithy C.",
    avatar: "https://i.pravatar.cc/120?img=11",
    quote:
      "ផ្លូវរៀនមានរចនាសម្ព័ន្ធជួយស្តារទំនុកចិត្តខ្ញុំឡើងវិញ។ មិនមែនតែរៀនទេ — គឺជឿថាខ្ញុំអាចបញ្ចប់ និងទទួលវិញ្ញាបនបត្រ។",
  },
  {
    name: "Dara L.",
    avatar: "https://i.pravatar.cc/120?img=5",
    quote:
      "ឥឡូវខ្ញុំត្រៀមខ្លួនកាន់តែច្រើនសម្រាប់តួនាទីជំនួយ IT ហើយបានអនុវត្តអ្វីដែលបានរៀនជាមួយក្រុមហើយ។",
  },
  {
    name: "Mey S.",
    avatar: "https://i.pravatar.cc/120?img=47",
    quote:
      "ការរៀនជាមួយ LSIH ពង្រីកជំនាញខ្ញុំតាមមេរៀនជាក់ស្តែង សំណួរសាកល្បង និងវិញ្ញាបនបត្រដែលអាចចែករំលែកជាមួយនិយោជក។",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-y bg-white">
      <div className="container-page">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
          ហេតុអ្វីមនុស្សជ្រើស Life Skills Innovation Hub?
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
