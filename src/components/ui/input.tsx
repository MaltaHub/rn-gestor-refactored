"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={clsx(
      "h-12 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
