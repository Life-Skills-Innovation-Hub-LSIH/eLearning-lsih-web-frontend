"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  MousePointerClick,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  fetchAdminAnalyticsOverview,
  type AdminAnalyticsOverview,
} from "../api/analytics-api";
import { PageLoader } from "@/shared/components/ui/PageLoader";

function formatDuration(seconds: number) {
  if (!seconds || seconds < 60) return `${seconds || 0}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function eventLabel(type: string) {
  if (type === "page_view") return "Page view";
  if (type === "page_leave") return "Time on page";
  if (type === "register") return "Registration";
  if (type === "login") return "Login";
  if (type === "enroll") return "Enrollment";
  return type;
}

export function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    void fetchAdminAnalyticsOverview(token, 30)
      .then((overview) => {
        if (!cancelled) setData(overview);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard.");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const maxViews = useMemo(() => {
    const totals = data?.views_by_day.map((item) => item.total) ?? [0];
    return Math.max(1, ...totals);
  }, [data]);

  if (loading) {
    return (
      <div className="py-16">
        <PageLoader label="Loading dashboard…" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Track visits, registrations, enrollments, and time on each page.
          </p>
        </div>
        <span className="rounded-full border border-[var(--admin-border-strong)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--admin-muted)]">
          Last {data?.range_days ?? 30} days
        </span>
      </div>

      {error ? (
        <div className="rounded-[var(--admin-radius)] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div
          className="rounded-2xl p-6 text-white shadow-[0_16px_40px_rgba(5,77,161,0.22)]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #054da1 0%, #0a6bc7 55%, #f05a25 130%)",
          }}
        >
          <p className="text-sm font-medium text-white/80">Platform pulse</p>
          <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-tight">
            See how learners discover, join, and enroll across LSIH.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-white/80">
            Every page visit, registration, login, and course enrollment is recorded so you can
            understand real usage.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Page views",
              value: formatNumber(stats?.page_views ?? 0),
              icon: MousePointerClick,
              tone: "bg-sky-50 text-sky-700",
            },
            {
              label: "Unique visitors",
              value: formatNumber(stats?.unique_visitors ?? 0),
              icon: Users,
              tone: "bg-indigo-50 text-indigo-700",
            },
            {
              label: "Registrations",
              value: formatNumber(stats?.registrations ?? 0),
              icon: UserPlus,
              tone: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Enrollments",
              value: formatNumber(stats?.enrollments ?? 0),
              icon: GraduationCap,
              tone: "bg-orange-50 text-orange-700",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-[var(--admin-border)] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-[var(--admin-muted)]">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--admin-text)]">
                      {item.value}
                    </p>
                  </div>
                  <span className={`inline-flex size-9 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon className="size-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Avg. time / page",
            value: formatDuration(stats?.avg_session_seconds ?? 0),
            icon: Clock3,
          },
          {
            label: "Total students",
            value: formatNumber(stats?.total_students ?? 0),
            icon: Users,
          },
          {
            label: "Paid students",
            value: formatNumber(stats?.paid_students ?? 0),
            icon: UserPlus,
          },
          {
            label: "Published courses",
            value: formatNumber(stats?.published_courses ?? 0),
            icon: BookOpen,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--admin-border)] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--admin-muted)]">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">{item.value}</p>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--admin-brand-soft)] text-[var(--admin-brand)]">
                  <Icon className="size-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[var(--admin-text)]">Visits report</h2>
            <span className="text-xs text-[var(--admin-muted)]">Page views / day</span>
          </div>
          {(data?.views_by_day.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--admin-muted)]">
              No visit data yet. Browse the public site to start collecting events.
            </p>
          ) : (
            <div className="flex h-52 items-end gap-1.5">
              {data!.views_by_day.map((item) => (
                <div key={item.day} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-[var(--admin-brand)]/85 transition group-hover:bg-[var(--admin-accent)]"
                    style={{ height: `${Math.max(8, (item.total / maxViews) * 100)}%` }}
                    title={`${item.day}: ${item.total}`}
                  />
                  <span className="truncate text-[10px] text-[var(--admin-subtle)]">
                    {item.day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="mb-4 text-base font-semibold text-[var(--admin-text)]">Top courses enrolled</h2>
          {(data?.top_courses.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--admin-muted)]">No enrollments yet.</p>
          ) : (
            <ul className="space-y-3">
              {data!.top_courses.map((course, index) => (
                <li
                  key={course.course_id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--admin-border)] px-3 py-2.5"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[var(--admin-brand-soft)] text-xs font-bold text-[var(--admin-brand)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
                      {course.title}
                    </p>
                    <p className="text-xs text-[var(--admin-muted)]">
                      {course.enrollments} enrollment{course.enrollments === 1 ? "" : "s"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="mb-4 text-base font-semibold text-[var(--admin-text)]">Top pages</h2>
          {(data?.top_pages.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--admin-muted)]">No page activity yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--admin-border)]">
              {data!.top_pages.map((page) => (
                <li key={page.path} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">{page.path}</p>
                    <p className="text-xs text-[var(--admin-muted)]">
                      Avg stay {formatDuration(page.avg_seconds)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--admin-brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--admin-brand)]">
                    {page.views}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="mb-4 text-base font-semibold text-[var(--admin-text)]">Recent activity</h2>
          {(data?.recent_activity.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--admin-muted)]">No events yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {data!.recent_activity.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-[var(--admin-border)] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--admin-text)]">
                      {eventLabel(event.event_type)}
                    </p>
                    <span className="text-[11px] text-[var(--admin-subtle)]">
                      {event.created_at
                        ? new Date(event.created_at).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">
                    {event.user?.name ?? "Guest"}
                    {event.path ? ` · ${event.path}` : ""}
                    {event.course?.title ? ` · ${event.course.title}` : ""}
                    {event.duration_seconds
                      ? ` · ${formatDuration(event.duration_seconds)}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
