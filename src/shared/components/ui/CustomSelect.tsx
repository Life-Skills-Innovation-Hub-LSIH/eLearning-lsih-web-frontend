"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function CustomSelect({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select…",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
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
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border bg-white px-3 py-2 text-left text-sm transition ${
          open
            ? "border-[var(--brand)] shadow-[0_0_0_3px_rgba(5,77,161,0.12)]"
            : "border-[var(--line)] hover:border-[#c5d0e0]"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className={selected ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-[#d8dee8] bg-white p-1.5 shadow-[0_12px_28px_rgba(15,39,68,0.12)]"
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-[var(--brand-soft)] font-medium text-[var(--brand)]"
                      : "text-[var(--ink)] hover:bg-[#f4f7fb]"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isActive ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
