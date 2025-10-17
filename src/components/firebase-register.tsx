"use client";

import { useEffect } from "react";

export function FirebaseRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Registrar o Service Worker do Firebase
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("[FirebaseRegister] Service Worker registrado com sucesso:", registration.scope);
        })
        .catch((error) => {
          console.error("[FirebaseRegister] Erro ao registrar Service Worker:", error);
        });
    }
  }, []);

  return null;
}
