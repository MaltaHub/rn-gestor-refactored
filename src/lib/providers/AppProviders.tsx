"use client";

import { PropsWithChildren } from "react";
import { QueryProvider } from "@/lib/providers/react-query-provider";
import { AuthStateEffect } from "@/lib/auth/AuthStateEffect"; // sincroniza Supabase
import { LogoutManager } from "@/lib/auth/LogoutManager"; // controla logout global

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthStateEffect />
      <LogoutManager />
      {children}
    </QueryProvider>
  );
}
