"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function TestNotificacao() {
  const [resultado, setResultado] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function testarNotificacao() {
    setLoading(true);
    setResultado("⏳ Testando...\n");

    try {
      // 1. Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setResultado(prev => prev + "❌ Usuário não autenticado!\n");
        return;
      }

      setResultado(prev => prev + `✅ Autenticado como: ${user.email}\n`);
      setResultado(prev => prev + `👤 User ID: ${user.id}\n\n`);

      // 3. Testar invocação
      setResultado(prev => prev + "📡 Invocando função enviar_notificacao...\n");

      const payload = {
        user_id: user.id,
        titulo: "Teste de Debug",
        mensagem: "Esta é uma notificação de teste enviada pelo componente de debug",
        tipo: "info"
      };

      setResultado(prev => prev + `📦 Payload: ${JSON.stringify(payload, null, 2)}\n\n`);

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('enviar_notificacao', {
        body: payload
      });
      const duration = Date.now() - startTime;

      setResultado(prev => prev + `⏱️ Tempo de resposta: ${duration}ms\n\n`);

      if (error) {
        setResultado(prev => prev + `❌ Erro retornado:\n${JSON.stringify(error, null, 2)}\n\n`);
      } else {
        setResultado(prev => prev + `✅ Sucesso!\n📊 Data: ${JSON.stringify(data, null, 2)}\n\n`);
      }

      // 4. Verificar se há notificação no banco
      setResultado(prev => prev + "🔍 Verificando notificações no banco...\n");
      const { data: notifs, error: notifError } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (notifError) {
        setResultado(prev => prev + `❌ Erro ao buscar: ${notifError.message}\n`);
      } else if (notifs && notifs.length > 0) {
        setResultado(prev => prev + `✅ Última notificação: ${notifs[0].titulo}\n`);
      } else {
        setResultado(prev => prev + "⚠️ Nenhuma notificação encontrada no banco\n");
      }

      // 5. Verificar tokens FCM
      setResultado(prev => prev + "\n🔍 Verificando tokens FCM...\n");
      const { data: tokens, error: tokensError } = await supabase
        .from('notificacoes_tokens')
        .select('token')
        .eq('user_id', user.id);

      if (tokensError) {
        setResultado(prev => prev + `❌ Erro ao buscar tokens: ${tokensError.message}\n`);
      } else if (tokens && tokens.length > 0) {
        setResultado(prev => prev + `✅ ${tokens.length} token(s) encontrado(s)\n`);
        tokens.forEach((t, i) => {
          setResultado(prev => prev + `   ${i + 1}. ${t.token.substring(0, 30)}...\n`);
        });
      } else {
        setResultado(prev => prev + "⚠️ Nenhum token FCM encontrado! Usuário precisa permitir notificações.\n");
      }

    } catch (error) {
      setResultado(prev => prev + `\n💥 Exceção capturada:\n${error instanceof Error ? error.message : String(error)}\n`);
      if (error instanceof Error && error.stack) {
        setResultado(prev => prev + `\nStack trace:\n${error.stack}\n`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500 p-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            🔧 Debug Notificações
          </h3>
          <button
            onClick={testarNotificacao}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? "Testando..." : "Testar Agora"}
          </button>
        </div>

        {resultado && (
          <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96 font-mono whitespace-pre-wrap">
            {resultado}
          </pre>
        )}

        {!resultado && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Clique em &quot;Testar Agora&quot; para executar diagnóstico completo
          </p>
        )}
      </div>
    </div>
  );
}