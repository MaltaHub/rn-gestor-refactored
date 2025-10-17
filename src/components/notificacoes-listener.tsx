"use client";

import { useEffect } from "react";
import { messaging } from "@/lib/firebase-client";
import { onMessage } from "firebase/messaging";
import { useToast } from "@/components/ui/toast";

export function NotificacoesListener() {
  const { mostrarToast } = useToast();

  useEffect(() => {
    if (!messaging) return;

    // Listener para mensagens em foreground (quando o app está aberto)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.warn("[NotificacoesListener] Mensagem recebida em foreground:", payload);

      const titulo = payload.notification?.title || "Nova notificação";
      const mensagem = payload.notification?.body || "";
      const tipo = (payload.data?.tipo as "info" | "success" | "warning" | "error") || "info";

      // Mostrar toast
      mostrarToast({
        titulo,
        mensagem,
        tipo,
        duracao: 8000, // 8 segundos
      });

      // Tocar som de notificação (opcional)
      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }

      // Atualizar badge (opcional)
      if ("setAppBadge" in navigator) {
        const nav = navigator as Navigator & { setAppBadge?: () => void };
        if (typeof nav.setAppBadge === "function") {
          nav.setAppBadge();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [mostrarToast]);

  return null;
}
