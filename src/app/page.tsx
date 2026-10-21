import {
  CourseColumnsSection,
  FeaturedProgramsBanner,
  MainBanner,
  PartnerStrip,
  PopularCoursesSection,
  PromoBannersSection,
  SubjectsSection,
  TestimonialsSection,
  WhyLsihSection,
} from "@/features/home";
import {
  fetchCatalogCourses,
  fetchCatalogSubjects,
  type CatalogSubject,
} from "@/features/learning/api/enrollment-api";

const learningPoints = [
  "Browse and open a published course",
  "Get a paid subscription from admin",
  "Complete lessons and pass module quizzes",
  "Download your e-certificate when finished",
];

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

      <CourseColumnsSection
        title="Trending courses"
        courses={popular.slice(0, 9)}
      />

      <PartnerStrip />
      <FeaturedProgramsBanner courses={courses} />

      <SubjectsSection subjects={subjects} />
      <PromoBannersSection />

      <CourseColumnsSection
        title="New courses"
        courses={latest.slice(0, 9)}
      />

      <div className="container-page section-y">
        <PopularCoursesSection
          title="Popular courses"
          subtitle="Most learners are studying these right now"
          courses={popular}
        />
      </div>

      <WhyLsihSection />

      <section className="container-page section-y">
        <div
          className="group relative origin-center overflow-hidden rounded-[1.75rem] px-6 py-10 transition-transform duration-500 ease-out will-change-transform hover:scale-[1.02] sm:px-10 sm:py-12 md:px-12"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 90% at 100% 50%, rgba(240, 90, 37, 0.55), transparent 55%), linear-gradient(115deg, #04356f 0%, #054da1 42%, #0a6bc7 72%, #f05a25 140%)",
          }}
        >
          <div className="relative grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Structured learning that sticks
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-white/80">
                Every course follows a clear path — modules, lessons, quizzes, and a certificate —
                so progress is measurable and career-ready.
              </p>
            </div>

            <ul className="space-y-3.5">
              {learningPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-white/95">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent-brand,#f05a25)] shadow-[0_0_0_4px_rgba(240,90,37,0.2)]"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed sm:text-base">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </main>
  );
}
