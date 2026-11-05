"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CourseCatalogDetail } from "@/features/courses";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { useLocale } from "@/shared/i18n/locale-context";
import {
  fetchCatalogCourse,
  type CatalogCourse,
} from "@/features/learning/api/enrollment-api";

export default function CourseDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { t } = useLocale();
  const [course, setCourse] = useState<CatalogCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    fetchCatalogCourse(slug)
      .then(setCourse)
      .catch((err) => {
        setCourse(null);
        setError(err instanceof Error ? err.message : t("course.notFound"));
      })
      .finally(() => setLoading(false));
  }, [slug, t]);

  if (loading) {
    return (
      <main className="container-page py-12">
        <PageLoader label={t("course.loading")} />
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="container-page py-12">
        <div className="surface max-w-lg space-y-4 p-8">
          <h1 className="font-display text-2xl text-[var(--ink)]">{t("course.notFound")}</h1>
          <p className="text-[var(--muted)]">{error || t("course.unavailable")}</p>
          <Link href="/courses" className="btn btn-primary">
            {t("course.backCatalog")}
          </Link>
        </div>
      </main>
    );
  }

  return <CourseCatalogDetail course={course} />;
}
