"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import {
  fetchCatalogCourses,
  fetchCatalogSubjects,
  type CatalogCourse,
  type CatalogSubject,
} from "@/features/learning/api/enrollment-api";
import { getLevelLabel } from "@/shared/lib/course-labels";
import { resolveMediaUrl } from "@/shared/lib/media";

type Props = {
  className?: string;
};

export function HeaderSearchDiscover({ className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    void Promise.all([fetchCatalogSubjects(), fetchCatalogCourses()])
      .then(([subjectList, courseList]) => {
        if (cancelled) return;
        setSubjects(subjectList.slice(0, 12));
        setCourses(courseList.slice(0, 3));
      })
      .catch(() => {
        if (cancelled) return;
        setSubjects([]);
        setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (inputRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  function submitSearch(value = query) {
    const q = value.trim();
    setOpen(false);
    window.location.href = q ? `/courses?q=${encodeURIComponent(q)}` : "/courses";
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          placeholder="តើអ្នកចង់រៀនអ្វី?"
          className="h-10 w-[240px] rounded-full border border-[var(--line)] bg-white pl-4 pr-12 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 xl:w-[300px]"
          aria-expanded={open}
          aria-controls="header-search-discover"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--brand)] text-white transition hover:bg-[var(--brand-strong)]"
          aria-label="ស្វែងរក"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/35"
            aria-hidden
            onClick={() => setOpen(false)}
          />

          <div
            id="header-search-discover"
            ref={panelRef}
            className="absolute left-0 top-[calc(100%+12px)] z-50 w-[min(92vw,720px)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
            role="dialog"
            aria-label="សំណើស្វែងរក"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3 sm:hidden">
              <p className="text-sm font-semibold text-[var(--ink)]">ស្វែងរក</p>
              <button
                type="button"
                className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                onClick={() => setOpen(false)}
                aria-label="បិទការស្វែងរក"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[min(70vh,560px)] space-y-6 overflow-y-auto px-5 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">
                  ប្រភេទពេញនិយម
                </h3>
                {loading && subjects.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">កំពុងផ្ទុកមុខវិជ្ជា…</p>
                ) : subjects.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">មិនទាន់មានមុខវិជ្ជាទេ។</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <Link
                        key={String(subject.id)}
                        href={`/courses?subject_id=${encodeURIComponent(String(subject.id))}`}
                        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink)] transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                        onClick={() => setOpen(false)}
                      >
                        {subject.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">
                  ចាប់ផ្តើមជាមួយវគ្គសិក្សាពេញនិយមទាំងនេះ
                </h3>
                {loading && courses.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">កំពុងផ្ទុកវគ្គសិក្សា…</p>
                ) : courses.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">មិនទាន់មានវគ្គសិក្សាទេ។</p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {courses.map((course) => {
                      const cover = resolveMediaUrl(course.cover_image);
                      const provider =
                        course.lecturer?.name?.trim() || "Life Skills Innovation Hub";

                      return (
                        <Link
                          key={String(course.id)}
                          href={`/courses/${course.slug}`}
                          className="group overflow-hidden rounded-xl border border-[var(--line)] bg-white transition hover:border-[var(--brand)]/30 hover:shadow-[0_10px_24px_rgba(5,77,161,0.12)]"
                          onClick={() => setOpen(false)}
                        >
                          <div className="relative h-28 overflow-hidden bg-[var(--brand-soft)]">
                            {cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cover}
                                alt=""
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-end bg-gradient-to-br from-[#054da1] to-[#0a6bc7] p-3">
                                <span className="text-xs font-medium text-white/90">
                                  {getLevelLabel(course.level)}
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-md bg-white shadow-sm">
                              <Image
                                src="/logo.png"
                                alt=""
                                width={18}
                                height={18}
                                className="size-[18px] object-contain"
                              />
                            </div>
                          </div>
                          <div className="space-y-1 p-3">
                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)]">
                              {course.title}
                            </p>
                            <p className="truncate text-xs text-[var(--muted)]">{provider}</p>
                            <p className="text-xs text-[var(--muted)]">
                              {getLevelLabel(course.level)}
                              {course.modules_count != null
                                ? ` · ${course.modules_count} ម៉ូឌុល`
                                : ""}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
