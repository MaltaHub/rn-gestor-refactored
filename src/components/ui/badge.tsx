"use client";

import { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300",
        className
      )}
      {...props}
    />
  );
}
