import { apiRequest } from "@/shared/api/client";

export type TrackEventPayload = {
  event_type: string;
  session_id?: string;
  path?: string;
  title?: string;
  duration_seconds?: number;
  course_id?: number | string;
  meta?: Record<string, unknown>;
};

export type AdminAnalyticsOverview = {
  range_days: number;
  stats: {
    page_views: number;
    unique_visitors: number;
    registrations: number;
    enrollments: number;
    avg_session_seconds: number;
    total_students: number;
    paid_students: number;
    published_courses: number;
  };
  views_by_day: Array<{ day: string; total: number }>;
  top_pages: Array<{ path: string; views: number; avg_seconds: number }>;
  top_courses: Array<{
    course_id: number;
    title: string;
    slug?: string | null;
    enrollments: number;
  }>;
  recent_activity: Array<{
    id: number;
    event_type: string;
    path?: string | null;
    title?: string | null;
    duration_seconds?: number | null;
    user?: { id: number; name: string; username?: string } | null;
    course?: { id: number; title: string } | null;
    created_at?: string | null;
  }>;
};

export async function trackAnalyticsEvent(
  payload: TrackEventPayload,
  token?: string | null,
) {
  try {
    await apiRequest("/analytics/events", {
      method: "POST",
      token,
      body: payload,
    });
  } catch {
    // Tracking must never break the UI.
  }
}

export async function fetchAdminAnalyticsOverview(
  token: string,
  days = 30,
): Promise<AdminAnalyticsOverview> {
  const payload = await apiRequest<{ data: AdminAnalyticsOverview }>(
    `/admin/analytics/overview?days=${days}`,
    { token },
  );
  return payload.data;
}
