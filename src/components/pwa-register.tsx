"use client";

import { useEffect } from "react";
import { Workbox } from "workbox-window";

const SW_PATH = "/sw.js";

export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    let wb: Workbox | null = null;

    const register = async () => {
      try {
        wb = new Workbox(SW_PATH);
        wb.addEventListener("waiting", () => {
          wb?.messageSW({ type: "SKIP_WAITING" });
        });
        await wb.register();
      } catch (err) {
        console.error("SW registration failed", err);
      }
    };

    register();

    return () => {
      wb?.messageSW({ type: "SKIP_WAITING" }).catch(() => undefined);
    };
  }, []);

  return null;
}
