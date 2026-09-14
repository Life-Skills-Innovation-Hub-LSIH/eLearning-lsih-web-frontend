"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => {
    clearTimers();
    setVisible(true);
    setWidth(12);

    timers.current.push(
      window.setTimeout(() => setWidth(55), 80),
      window.setTimeout(() => setWidth(78), 220),
      window.setTimeout(() => setWidth(100), 420),
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 620),
    );

    return clearTimers;
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }

      clearTimers();
      setVisible(true);
      setWidth(18);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!visible && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px]"
      aria-hidden
    >
      <div
        className="h-full origin-left rounded-r-full bg-[var(--brand)] shadow-[0_0_12px_rgba(5,77,161,0.55)] transition-[width,opacity] duration-300 ease-out"
        style={{
          width: `${width}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
