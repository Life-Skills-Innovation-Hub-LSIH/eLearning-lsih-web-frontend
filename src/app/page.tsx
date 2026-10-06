import Link from "next/link";
import {
  FeaturedProgramsBanner,
  HowItWorksSection,
  MainBanner,
  PartnerStrip,
  PopularCoursesSection,
  SubjectsSection,
  WhyLsihSection,
} from "@/features/home";
import {
  fetchCatalogCourses,
  fetchCatalogSubjects,
  type CatalogSubject,
} from "@/features/learning/api/enrollment-api";

export default async function HomePage() {
  let courses: Awaited<ReturnType<typeof fetchCatalogCourses>> = [];
  let subjects: CatalogSubject[] = [];

  const [coursesResult, subjectsResult] = await Promise.allSettled([
    fetchCatalogCourses(),
    fetchCatalogSubjects(),
  ]);

  if (coursesResult.status === "fulfilled") courses = coursesResult.value;
  if (subjectsResult.status === "fulfilled") subjects = subjectsResult.value;

  const popular = courses.slice(0, 12);
  const latest = [...courses].reverse().slice(0, 12);

  return (
    <main>
      <MainBanner />
      <PartnerStrip />
      <FeaturedProgramsBanner courses={courses} />
      <SubjectsSection subjects={subjects} />

      <div className="container-page flex flex-col gap-14 py-14 sm:gap-16 sm:py-16">
        <PopularCoursesSection
          title="Popular courses"
          subtitle="Most learners are studying these right now"
          courses={popular}
        />
        <PopularCoursesSection
          title="Latest courses"
          subtitle="New and recently updated learning tracks"
          courses={latest}
        />
      </div>

      <HowItWorksSection />
      <WhyLsihSection />

      <section className="relative overflow-hidden bg-[var(--brand)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(255,255,255,0.18), transparent 55%)",
          }}
        />
        <div className="container-page relative grid items-center gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Structured learning that sticks
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-white/80">
              Every course follows a clear path — modules, lessons, quizzes, and a certificate —
              so progress is measurable and career-ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-accent">
                Explore courses
              </Link>
              <Link
                href="/register"
                className="btn border border-white/25 bg-white/10 !text-white hover:bg-white/18"
              >
                Create account
              </Link>
            </div>
          </div>

          <ol className="space-y-4 text-white/90">
            {[
              "Browse and open a course",
              "Get a paid subscription from admin",
              "Complete lessons and module quizzes",
              "Download your certificate",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-relaxed sm:text-base">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
