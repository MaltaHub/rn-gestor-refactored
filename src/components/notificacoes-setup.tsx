"use client";

import { useEffect } from "react";
import { solicitarPermissaoNotificacao } from "@/lib/firebase-client";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export function NotificacoesSetup() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let cancelled = false;

    async function setupNotificacoes() {
      try {
        // Solicitar permissão e obter token
        const token = await solicitarPermissaoNotificacao();

        if (cancelled || !token) return;

        if (token && !cancelled && user) {
          await supabase
            .from("notificacoes_tokens")
            .upsert({
              user_id: user.id,
              token,
              atualizado_em: new Date().toISOString()
            });

          console.warn("[NotificacoesSetup] Token FCM salvo com sucesso");
        }
      } catch (error) {
        console.error("[NotificacoesSetup] Erro ao configurar notificações:", error);
      }
    }

    setupNotificacoes();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  return null;
}
