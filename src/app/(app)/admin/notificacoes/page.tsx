"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useAuth } from "@/hooks/use-auth";
import { Send, Bell, Users, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export default function EnviarNotificacoesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: empresa, isLoading } = useEmpresaDoUsuario(isAuthenticated);
  const { mostrarToast } = useToast();

  const [destinatario, setDestinatario] = useState<"todos" | "user">("todos");
  const [userId, setUserId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Apenas proprietários podem enviar
  const isProprietario = empresa?.papel === "proprietario";

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
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

  // Função principal de envio
  async function handleEnviar() {
    if (!titulo || !mensagem) {
      mostrarToast({
        titulo: "Erro",
        mensagem: "Preencha o título e a mensagem",
        tipo: "error",
      });
      return;
    }

    setEnviando(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Sessão inválida ou expirada");
      }

      const token = sessionData.session.access_token;

      // Função genérica de envio
      const enviarNotificacao = async (targetUserId: string) => {
        const response = await fetch(
          "https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: targetUserId,
              titulo,
              mensagem,
            }),
          }
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Erro HTTP ${response.status}: ${text}`);
        }
        return response.json();
      };

      if (destinatario === "todos") {
        const { data: membros, error: membrosError } = await supabase
          .from("membros_empresa")
          .select("usuario_id")
          .eq("empresa_id", empresa?.empresa_id)
          .eq("ativo", true);

        if (membrosError) throw membrosError;
        if (!membros?.length) throw new Error("Nenhum membro ativo encontrado.");

        const results = await Promise.allSettled(
          membros.map((m) => enviarNotificacao(m.usuario_id))
        );

        const success = results.filter((r) => r.status === "fulfilled").length;
        const fail = results.filter((r) => r.status === "rejected").length;

        mostrarToast({
          titulo: "Envio concluído",
          mensagem: `${success} notificações enviadas com sucesso${
            fail ? `, ${fail} falharam` : ""
          }.`,
          tipo: success ? "success" : "error",
        });
      } else {
        if (!userId) {
          mostrarToast({
            titulo: "Erro",
            mensagem: "Informe o ID do usuário destinatário",
            tipo: "error",
          });
          return;
        }
        await enviarNotificacao(userId);
        mostrarToast({
          titulo: "Sucesso!",
          mensagem: "Notificação enviada para o usuário selecionado.",
          tipo: "success",
        });
      }

      // Limpa os campos
      setTitulo("");
      setMensagem("");
      setUserId("");
    } catch (err: unknown) {
      console.error("Erro ao enviar:", err);
      const mensagemErro = err instanceof Error ? err.message : "Falha ao enviar notificações";
      mostrarToast({
        titulo: "Erro",
        mensagem: mensagemErro,
        tipo: "error",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Central de Notificações
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 space-y-6">
        {/* Tipo de destinatário */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setDestinatario("todos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
              destinatario === "todos"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <Users className="w-5 h-5" /> Todos os membros
          </button>
          <button
            onClick={() => setDestinatario("user")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
              destinatario === "user"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <User className="w-5 h-5" /> Usuário específico
          </button>
        </div>

        {destinatario === "user" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID do Usuário
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID do usuário"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>
        )}

        {/* Campos de notificação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Atualização no sistema"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mensagem
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            placeholder="Digite o conteúdo da notificação..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none"
          />
        </div>

        <button
          onClick={handleEnviar}
          disabled={enviando}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-lg transition ${
            enviando
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-[1.02]"
          }`}
        >
          {enviando ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Enviar Notificação
            </>
          )}
        </button>
      </div>
    </div>
  );
}
