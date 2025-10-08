"use client";

import { useEffect } from "react";
import { THEME_SCHEDULE } from "@/config";

const applyThemeByHour = () => {
  const hour = new Date().getHours();
  const isDark = hour >= THEME_SCHEDULE.NIGHT_START || hour < THEME_SCHEDULE.NIGHT_END;
  const root = document.documentElement;
  root.dataset.theme = isDark ? "dark" : "light";
  root.classList.toggle("dark", isDark);
};

export function ThemeScheduler() {
  useEffect(() => {
    applyThemeByHour();
    const interval = window.setInterval(applyThemeByHour, THEME_SCHEDULE.REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return null;
}
