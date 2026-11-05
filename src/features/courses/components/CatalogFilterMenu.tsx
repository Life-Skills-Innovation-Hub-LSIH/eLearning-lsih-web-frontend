"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
  hint?: string;
};

type Props = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onApply: (next: string[]) => void;
  viewLabel: string;
  clearLabel: string;
};

export function CatalogFilterMenu({
  label,
  options,
  selected,
  onApply,
  viewLabel,
  clearLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selected);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  useEffect(() => {
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }

    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menu = document.getElementById(`catalog-filter-${label}`);
      if (menu?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [label]);

  const count = selected.length;
  const buttonLabel = count ? `${label} (${count})` : label;

  function toggle(value: string) {
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition ${
          open || count
            ? "border-[var(--brand)] bg-[var(--brand-soft)] !text-[var(--brand)]"
            : "border-[#d4d8de] bg-white !text-[#1a1a1a] hover:bg-[#f7f8fa]"
        }`}
      >
        {buttonLabel}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              id={`catalog-filter-${label}`}
              style={{ top: coords.top, left: coords.left }}
              className="fixed z-[80] w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-[#e6e8eb] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
            >
              <div className="border-b border-[#eef0f3] px-4 py-3">
                <p className="text-base font-medium text-[#1a1a1a]">{label}</p>
              </div>
              <div className="max-h-[320px] overflow-y-auto py-1">
                {options.map((option) => {
                  const checked = draft.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[#f7f8fa]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(option.value)}
                        className="mt-0.5 size-4 cursor-pointer rounded border-[#c5ccd6] text-[var(--brand)] accent-[var(--brand)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#1a1a1a]">
                          {option.label}
                        </span>
                        {option.hint ? (
                          <span className="mt-0.5 block text-sm leading-snug text-[#6b7280]">
                            {option.hint}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 border-t border-[#eef0f3] px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    onApply(draft);
                    setOpen(false);
                  }}
                  className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[var(--brand)] px-4 text-sm font-medium text-white hover:bg-[var(--brand-strong)]"
                >
                  {viewLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft([]);
                    onApply([]);
                    setOpen(false);
                  }}
                  className="cursor-pointer text-sm font-medium text-[#6b7280] hover:text-[var(--brand)]"
                >
                  {clearLabel}
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
