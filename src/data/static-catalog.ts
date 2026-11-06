import catalog from "@/data/catalog.json";
import type {
  CatalogCourse,
  CatalogCoursesPage,
  CatalogSubject,
  CourseReview,
} from "@/features/learning/api/enrollment-api";

const subjects = catalog.subjects as CatalogSubject[];
const courses = catalog.courses as CatalogCourse[];
const reviews = catalog.reviews as CourseReview[];

function haystack(course: CatalogCourse) {
  return [
    course.title,
    course.slug,
    course.short_description,
    course.description,
    course.lecturer?.name,
    ...(course.subjects ?? []).map((s) => `${s.name} ${s.slug}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesDuration(minutes: number, durations: string[]) {
  if (!durations.length) return true;
  return durations.some((bucket) => {
    if (bucket === "short") return minutes > 0 && minutes < 60;
    if (bucket === "medium") return minutes >= 60 && minutes <= 180;
    if (bucket === "long") return minutes > 180;
    return false;
  });
}

function listItem(course: CatalogCourse): CatalogCourse {
  return { ...course, modules: undefined };
}

export function getStaticSubjects(): CatalogSubject[] {
  return subjects;
}

export function queryStaticCourses(options?: {
  search?: string;
  subjectId?: string | number;
  levels?: string[];
  durations?: string[];
}): CatalogCourse[] {
  const search = options?.search?.trim().toLowerCase();
  const subjectId =
    options?.subjectId != null && String(options.subjectId).trim() !== ""
      ? String(options.subjectId)
      : "";
  const levels = (options?.levels ?? []).map((level) => level.toLowerCase());
  const durations = options?.durations ?? [];

  return courses
    .filter((course) => {
      if (search && !haystack(course).includes(search)) return false;
      if (subjectId && !(course.subjects ?? []).some((s) => String(s.id) === subjectId)) {
        return false;
      }
      if (levels.length && !levels.includes((course.level ?? "").toLowerCase())) {
        return false;
      }
      if (!matchesDuration(course.duration_minutes ?? 0, durations)) return false;
      return true;
    })
    .map(listItem);
}

export function paginateStaticCourses(options?: {
  search?: string;
  subjectId?: string | number;
  page?: number;
  perPage?: number;
  levels?: string[];
  durations?: string[];
}): CatalogCoursesPage {
  const page = Math.max(1, options?.page ?? 1);
  const perPage = Math.max(1, options?.perPage ?? 15);
  const filtered = queryStaticCourses(options);
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  return {
    data: filtered.slice(start, start + perPage),
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total: filtered.length,
    },
  };
}

export function getStaticCourse(slugOrId: string): CatalogCourse | null {
  const key = slugOrId.trim().toLowerCase();
  return (
    courses.find(
      (course) => String(course.id) === slugOrId || course.slug.toLowerCase() === key,
    ) ?? null
  );
}

export function getStaticReviews(slugOrId: string): CourseReview[] {
  const course = getStaticCourse(slugOrId);
  if (!course) return [];
  return reviews.filter((review) => String(review.course_id) === String(course.id));
}
