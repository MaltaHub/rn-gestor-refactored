import { ReactNode } from "react";

import { AppShell } from "@/components/navigation/app-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
