"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export type ActionMenuItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type Props = {
  items: ActionMenuItem[];
  align?: "left" | "right";
};

type MenuPosition = {
  top: number;
  left: number;
};

export function ActionMenu({ items, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = menu?.offsetWidth ?? 180;
      const menuHeight = menu?.offsetHeight ?? items.length * 40 + 8;
      const gap = 4;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < menuHeight + gap && spaceAbove > spaceBelow;

      const top = openUpward ? rect.top - menuHeight - gap : rect.bottom + gap;
      const left =
        align === "right"
          ? Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8))
          : Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));

      setPosition({ top, left });
    }

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, items.length]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menu =
    open && mounted ? (
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        style={{
          position: "fixed",
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          visibility: position ? "visible" : "hidden",
        }}
        className="z-[200] min-w-[180px] rounded-lg border border-[#eaecf0] bg-white py-1 shadow-[0_12px_16px_-4px_rgba(16,24,40,0.08),0_4px_6px_-2px_rgba(16,24,40,0.03)]"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              setOpen(false);
              item.onClick();
            }}
            className={`flex w-full cursor-pointer px-3 py-2 text-left text-sm transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50 ${
              item.destructive ? "text-[#b42318]" : "text-[#344054]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {menu && createPortal(menu, document.body)}
    </div>
  );
}
