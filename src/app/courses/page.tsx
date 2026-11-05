"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, ChevronRight, Home } from "lucide-react";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { useLocale } from "@/shared/i18n/locale-context";
import {
  courseMatchesTrack,
  EXPLORE_CATEGORIES,
  getTrackLabel,
  type LearningTrackId,
} from "@/shared/lib/learning-tracks";
import { CatalogFilterMenu } from "@/features/courses/components/CatalogFilterMenu";
import { ExploreCourseCard } from "@/features/courses/components/ExploreCourseCard";
import {
  fetchCatalogCoursesPage,
  fetchCatalogSubjects,
  type CatalogCourse,
  type CatalogSubject,
} from "@/features/learning/api/enrollment-api";

const TRACK_IDS = new Set<string>(EXPLORE_CATEGORIES.map((c) => c.track));
const PAGE_SIZE = 15;

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();
  const query = searchParams.get("q") ?? "";
  const subjectId = searchParams.get("subject_id") ?? "";
  const trackParam = searchParams.get("track") ?? "";
  const activeTrack = (
    TRACK_IDS.has(trackParam) ? trackParam : ""
  ) as LearningTrackId | "";
  const [levels, setLevels] = useState<string[]>([]);
  const [durations, setDurations] = useState<string[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeSubject = useMemo(
    () => subjects.find((item) => String(item.id) === subjectId) ?? null,
    [subjects, subjectId],
  );

  useEffect(() => {
    fetchCatalogSubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError("");
      }
      try {
        const result = await fetchCatalogCoursesPage({
          search: query.trim() || undefined,
          subjectId: subjectId || undefined,
          page: nextPage,
          perPage: PAGE_SIZE,
          levels,
          durations,
        });
        setCourses((prev) => (append ? [...prev, ...result.data] : result.data));
        setPage(result.meta.current_page);
        setLastPage(result.meta.last_page);
      } catch (err) {
        if (!append) {
          setCourses([]);
          setError(err instanceof Error ? err.message : "Failed to load courses.");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, subjectId, levels, durations],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const hasMore = page < lastPage;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          void loadPage(page + 1, true);
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadPage, page]);

  const visible = useMemo(() => {
    if (!activeTrack) return courses;
    return courses.filter((course) => courseMatchesTrack(course, activeTrack));
  }, [courses, activeTrack]);

  const title = activeSubject
    ? activeSubject.name
    : activeTrack
      ? getTrackLabel(activeTrack, locale)
      : t("catalog.title");

  const subtitle = activeSubject?.description?.trim()
    ? activeSubject.description.trim()
    : t("catalog.subtitle");

  return (
    <main className="bg-white">
      <section className="container-page pb-16 pt-6 sm:pt-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-[#6b7280]"
        >
          <Link
            href="/"
            className="inline-flex items-center transition hover:text-[var(--brand)]"
            aria-label={t("catalog.home")}
          >
            <Home className="h-4 w-4" strokeWidth={2} />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#c0c7cf]" strokeWidth={2} />
          <Link href="/courses" className="transition hover:text-[var(--brand)]">
            {t("course.courses")}
          </Link>
          {activeTrack || activeSubject ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-[#c0c7cf]" strokeWidth={2} />
              <span className="text-[#6b7280]">{title}</span>
            </>
          ) : null}
        </nav>

        <div className="max-w-3xl">
          <h1 className="font-display text-[2rem] font-medium tracking-tight text-[#1a1a1a] sm:text-[2.5rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#374151]">{subtitle}</p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <CatalogFilterMenu
            label={t("catalog.level")}
            selected={levels}
            onApply={setLevels}
            viewLabel={t("catalog.view")}
            clearLabel={t("catalog.clearAll")}
            options={[
              {
                value: "beginner",
                label: t("catalog.levelBeginner"),
                hint: t("catalog.levelBeginnerHint"),
              },
              {
                value: "intermediate",
                label: t("catalog.levelIntermediate"),
                hint: t("catalog.levelIntermediateHint"),
              },
              {
                value: "advanced",
                label: t("catalog.levelAdvanced"),
                hint: t("catalog.levelAdvancedHint"),
              },
            ]}
          />
          <CatalogFilterMenu
            label={t("catalog.duration")}
            selected={durations}
            onApply={setDurations}
            viewLabel={t("catalog.view")}
            clearLabel={t("catalog.clearAll")}
            options={[
              {
                value: "short",
                label: t("catalog.durationShort"),
                hint: t("catalog.durationShortHint"),
              },
              {
                value: "medium",
                label: t("catalog.durationMedium"),
                hint: t("catalog.durationMediumHint"),
              },
              {
                value: "long",
                label: t("catalog.durationLong"),
                hint: t("catalog.durationLongHint"),
              },
            ]}
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <PageLoader label={t("catalog.loading")} />
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <BookOpen className="h-10 w-10 text-[#c5ccd6]" />
              <p className="mt-4 text-xl font-medium text-[#1a1a1a]">{t("catalog.noCourses")}</p>
              <p className="mt-1 max-w-md text-sm text-[#374151]">{t("catalog.noCoursesHint")}</p>
              <button
                type="button"
                className="mt-5 cursor-pointer rounded-full border border-[#d4d8de] px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#f7f8fa]"
                onClick={() => {
                  setLevels([]);
                  setDurations([]);
                }}
              >
                {t("catalog.clearFilters")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {visible.map((course) => (
                  <ExploreCourseCard
                    key={String(course.id)}
                    course={course}
                    ifYouLikeLabel={t("catalog.ifYouLike")}
                    credentialsLabel={t("catalog.credentials")}
                  />
                ))}
              </div>
              <div ref={sentinelRef} className="h-10" />
              {loadingMore ? (
                <p className="py-6 text-center text-sm text-[#6b7280]">{t("catalog.loadingMore")}</p>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
