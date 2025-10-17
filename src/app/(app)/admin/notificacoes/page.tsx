"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useAuth } from "@/hooks/use-auth";
import { Send, Bell, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export default function EnviarNotificacoesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: empresa, isLoading } = useEmpresaDoUsuario(isAuthenticated);
  const { mostrarToast } = useToast();

  const [enviando, setEnviando] = useState(false);

  // Verificar se é proprietário
  const isProprietario = empresa?.papel === "proprietario";

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isProprietario) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            Acesso Negado
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Apenas proprietários podem enviar notificações.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar para Admin
          </button>
        </div>
      </div>
    );
  }

  async function handleNotificarTodos() {
    setEnviando(true);

    try {
      // Buscar todos os membros da empresa
      const { data: membros, error: membrosError } = await supabase
        .from("membros_empresa")
        .select("usuario_id")
        .eq("empresa_id", empresa?.empresa_id)
        .eq("ativo", true);

      if (membrosError) throw membrosError;

      if (!membros || membros.length === 0) {
        mostrarToast({
          titulo: "Aviso",
          mensagem: "Nenhum membro encontrado na empresa",
          tipo: "warning",
        });
        return;
      }

      // Função auxiliar para enviar notificação via fetch
      const enviarNotificacao = async (targetUserId: string) => {
        const payload = {
          user_id: targetUserId,
          titulo: "Notificação Geral",
          mensagem: "Você tem uma nova notificação do sistema",
          tipo: "info",
        };

        const response = await fetch(
          "https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        return response.json();
      };

      // Enviar para todos os membros
      const promises = membros.map((membro) =>
        enviarNotificacao(membro.usuario_id)
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failedCount = results.filter((r) => r.status === "rejected").length;

      mostrarToast({
        titulo: "Concluído!",
        mensagem: `${successCount} notificações enviadas com sucesso${failedCount > 0 ? `, ${failedCount} falharam` : ""}`,
        tipo: successCount > 0 ? "success" : "error",
      });
    } catch (error) {
      console.error("Erro ao enviar notificações:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar notificações";
      mostrarToast({
        titulo: "Erro",
        mensagem: errorMessage,
        tipo: "error",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Central de Notificações
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Bell className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Enviar Notificação para Todos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Envie uma notificação instantânea para todos os membros ativos da empresa
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-2">ℹ️ Informações:</p>
            <ul className="text-left space-y-1">
              <li>• Será enviada para todos os membros ativos</li>
              <li>• Notificação via Firebase Cloud Messaging</li>
              <li>• Disponível apenas para proprietários</li>
            </ul>
          </div>

          <button
            onClick={handleNotificarTodos}
            disabled={enviando}
            className={`
              inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg
              transition-all duration-200 shadow-lg
              ${
                enviando
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:shadow-xl hover:scale-105"
              }
            `}
          >
            {enviando ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>Notificar Todos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card de estatísticas ou informações adicionais */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Status</p>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Sistema Ativo</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Método</p>
              <p className="text-sm font-bold text-green-900 dark:text-green-100">FCM Push</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Permissão</p>
              <p className="text-sm font-bold text-purple-900 dark:text-purple-100">Admin Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
