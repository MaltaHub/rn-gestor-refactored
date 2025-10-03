"use client";

import { useEffect } from "react";

const NIGHT_START = 18; // 18:00
const NIGHT_END = 6; // before 06:00
const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const applyThemeByHour = () => {
  const hour = new Date().getHours();
  const isDark = hour >= NIGHT_START || hour < NIGHT_END;
  const root = document.documentElement;
  root.dataset.theme = isDark ? "dark" : "light";
  root.classList.toggle("dark", isDark);
};

export function ThemeScheduler() {
  useEffect(() => {
    applyThemeByHour();
    const interval = window.setInterval(applyThemeByHour, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return null;
}
