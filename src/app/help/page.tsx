import Link from "next/link";
import {
  BookOpen,
  CircleHelp,
  GraduationCap,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata = { title: "ជំនួយ | Help" };

const sections = [
  {
    icon: Sparkles,
    title: "តើ Life Skills Innovation Hub ជាអ្វី?",
    body: "Life Skills Innovation Hub (LSIH) គឺជាវេទិកាសិក្សាអនឡាញដែលជួយអ្នកសិក្សានៅកម្ពុជារៀនជំនាញជាក់ស្តែង តាមរយៈវគ្គសិក្សាមានរចនាសម្ព័ន្ធ — ម៉ូឌុល មេរៀន (វីដេអូ/PDF) សំណួរសាកល្បង និងវិញ្ញាបនបត្រនៅពេលបញ្ចប់។",
  },
  {
    icon: KeyRound,
    title: "ចុះឈ្មោះ និងចូលគណនី",
    body: "អ្នកអាចចុះឈ្មោះជាសិស្សដោយចុច «រៀនឥតគិតថ្លៃ» ឬ «ចុះឈ្មោះ»។ បន្ទាប់ពីមានគណនី ចូលតាម «ចូលគណនី» ដើម្បីមើលវគ្គសិក្សា រៀន និងតាមដានវឌ្ឍនភាព។",
  },
  {
    icon: BookOpen,
    title: "រក និងចុះឈ្មោះវគ្គសិក្សា",
    body: "ប្រើ «ស្វែងរក» ឬរបារស្វែងរក «តើអ្នកចង់រៀនអ្វី?» ដើម្បីរកវគ្គ។ បើកទំព័រវគ្គដើម្បីមើលព័ត៌មាន ម៉ូឌុល និងចុះឈ្មោះរៀន។ វគ្គមួយចំនួនត្រូវការការជាវ ដែលអ្នកគ្រប់គ្រងអាចបើកឲ្យអ្នក។",
  },
  {
    icon: GraduationCap,
    title: "របៀបរៀនលើវេទិកា",
    body: "វគ្គនីមួយៗមានម៉ូឌុល។ ក្នុងម៉ូឌុលមានមេរៀន (វីដេអូ ឬ PDF) និងសំណួរសាកល្បង។ រៀនតាមលំដាប់ បំពេញមេរៀន រួចប្រឡងឲ្យជាប់។ នៅពេលបញ្ចប់វគ្គ អ្នកអាចទទួលវិញ្ញាបនបត្រ។",
  },
  {
    icon: ShieldCheck,
    title: "វគ្គសិក្សារបស់ខ្ញុំ និងគណនី",
    body: "បន្ទាប់ពីចូលគណនី ចុច «វគ្គសិក្សារខ្ញុំ» ដើម្បីមើលវគ្គដែលអ្នកកំពុងរៀន។ អាចកែព័ត៌មានគណនីតាមម៉ឺនុយប្រវត្តិរូប (រូបតំណាង) នៅជ្រុងខាងស្តាំនៃបឋមកថា។",
  },
  {
    icon: MessageCircle,
    title: "ត្រូវការជំនួយបន្ថែម?",
    body: "ប្រសិនបើមានសំណួរអំពីការជាវ គណនី ឬវគ្គសិក្សា សូមទាក់ទងក្រុម LSIH តាមទំព័រទំនាក់ទំនង ឬអ៊ីមែល lifeskillsinnovationhub@lsih.com។",
  },
];

export default function HelpPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page py-12 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-semibold text-[var(--brand)]">
            <CircleHelp className="h-4 w-4" />
            មជ្ឈមណ្ឌលជំនួយ
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            ជំនួយអំពីវេទិកា LSIH
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            រកចម្លើយអំពីរបៀបប្រើ Life Skills Innovation Hub — ចុះឈ្មោះ រៀនវគ្គ
            ប្រឡង និងទទួលវិញ្ញាបនបត្រ។
          </p>
        </div>
      </section>

      <section className="container-page space-y-4 py-10 sm:py-14">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <article
              key={section.title}
              className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">{section.title}</h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
                    {section.body}
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/contact" className="btn btn-primary">
            ទាក់ទងយើង
          </Link>
          <Link href="/courses" className="btn btn-secondary">
            មើលវគ្គសិក្សា
          </Link>
        </div>
      </section>
    </main>
  );
}
