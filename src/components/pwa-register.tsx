"use client";

import { useEffect } from "react";

const SW_PATH = "/sw.js";

export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register(SW_PATH).catch((err) => {
      console.error("SW registration failed", err);
    });
  }, []);

  return null;
}
