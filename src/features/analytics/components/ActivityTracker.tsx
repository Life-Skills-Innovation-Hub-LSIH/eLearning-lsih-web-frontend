"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { trackAnalyticsEvent } from "../api/analytics-api";

const SESSION_KEY = "lsih-analytics-session";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    value =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

export function ActivityTracker() {
  const pathname = usePathname();
  const { token } = useAuth();
  const startedAtRef = useRef<number>(Date.now());
  const pathRef = useRef<string>(pathname);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const previousPath = pathRef.current;
    const previousStarted = startedAtRef.current;
    const now = Date.now();

    if (previousPath && previousPath !== pathname) {
      const duration = Math.max(1, Math.round((now - previousStarted) / 1000));
      void trackAnalyticsEvent(
        {
          event_type: "page_leave",
          session_id: sessionId,
          path: previousPath,
          title: typeof document !== "undefined" ? document.title : undefined,
          duration_seconds: duration,
        },
        token,
      );
    }

    pathRef.current = pathname;
    startedAtRef.current = now;

    void trackAnalyticsEvent(
      {
        event_type: "page_view",
        session_id: sessionId,
        path: pathname,
        title: typeof document !== "undefined" ? document.title : undefined,
      },
      token,
    );

    function flushLeave() {
      const duration = Math.max(
        1,
        Math.round((Date.now() - startedAtRef.current) / 1000),
      );
      void trackAnalyticsEvent(
        {
          event_type: "page_leave",
          session_id: sessionId,
          path: pathRef.current,
          title: typeof document !== "undefined" ? document.title : undefined,
          duration_seconds: duration,
        },
        token,
      );
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") flushLeave();
      if (document.visibilityState === "visible") {
        startedAtRef.current = Date.now();
      }
    }

    window.addEventListener("beforeunload", flushLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", flushLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname, token]);

  return null;
}
