"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"input">, "type"> & {
  inputClassName?: string;
};

export function PasswordInput({
  className,
  inputClassName,
  disabled,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        {...props}
        // type="password" is required for Chrome/Safari password autofill
        type={visible ? "text" : "password"}
        disabled={disabled}
        spellCheck={false}
        className={cn(
          inputClassName,
          "pr-12 text-[16px] font-normal leading-normal tracking-normal",
        )}
      />
      <button
        type="button"
        className="absolute top-1/2 right-1.5 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[#475467] transition hover:bg-black/5 hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible((prev) => !prev);
        }}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="size-5" strokeWidth={2} />
        ) : (
          <Eye className="size-5" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
