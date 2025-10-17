"use client";

import { useEffect } from "react";
import { solicitarPermissaoNotificacao } from "@/lib/firebase-client";
import { supabase } from "@/lib/supabase";

export function NotificacoesSetup() {
  useEffect(() => {
    async function setupNotificacoes() {
      try {

        // Verificar se usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Solicitar permissão e obter token
        const token = await solicitarPermissaoNotificacao();

        if (token) {
          // Salvar token no banco de dados
          await supabase
            .from("notificacoes_tokens")
            .upsert({
              user_id: user.id,
              token,
              atualizado_em: new Date().toISOString()
            });

          console.log("[NotificacoesSetup] Token FCM salvo com sucesso");
        }
      } catch (error) {
        console.error("[NotificacoesSetup] Erro ao configurar notificações:", error);
      }
    }

    setupNotificacoes();
  }, []);

  return null;
}
