import { ReactNode } from "react";
import { clsx } from "clsx";

interface StandardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function StandardLayout({ children, className }: StandardLayoutProps) {
  return (
    <div className={clsx("mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-10", className)}>
      {children}
    </div>
  );
}
