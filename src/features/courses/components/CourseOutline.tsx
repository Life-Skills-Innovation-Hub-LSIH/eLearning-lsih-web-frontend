import type { Course } from "@/shared/types";

type Props = {
  course: Course;
};

export function CourseOutline({ course }: Props) {
  return (
    <div className="space-y-4">
      {course.modules.map((module) => (
        <section key={module.id} className="surface p-5">
          <div className="mb-3">
            <h3 className="font-display text-xl text-[var(--ink)]">{module.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{module.description}</p>
          </div>

          <ul className="space-y-2">
            {module.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{lesson.title}</p>
                  <p className="text-[var(--muted)]">
                    {lesson.type.toUpperCase()} · {lesson.durationMinutes} min
                    {lesson.isFreePreview ? " · Free preview" : ""}
                  </p>
                </div>
              </li>
            ))}
            {module.quiz ? (
              <li className="rounded-xl border border-dashed border-[var(--brand)]/30 bg-[color-mix(in_srgb,var(--brand)_6%,white)] px-3 py-2.5 text-sm">
                <p className="font-medium text-[var(--brand)]">Module Quiz — {module.quiz.title}</p>
                <p className="text-[var(--muted)]">
                  {module.quiz.questions.length} questions · pass {module.quiz.passingScore}%
                </p>
              </li>
            ) : null}
          </ul>
        </section>
      ))}

      {course.courseQuiz ? (
        <section className="surface border-[var(--accent)]/30 p-5">
          <h3 className="font-display text-xl text-[var(--ink)]">
            End-of-Course Quiz
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {course.courseQuiz.title} · {course.courseQuiz.questions.length} questions ·
            pass {course.courseQuiz.passingScore}%
          </p>
        </section>
      ) : null}
    </div>
  );
}
