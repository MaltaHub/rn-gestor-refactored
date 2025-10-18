"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useAuth } from "@/hooks/use-auth";
import { Send, Bell, Users, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

type MembroOption = {
  id: string;
  label: string;
  email: string | null;
  name: string | null;
};

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
  const [membrosOptions, setMembrosOptions] = useState<MembroOption[]>([]);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const enviandoRef = useRef(false);

  // Apenas proprietários podem enviar
  const isProprietario = empresa?.papel === "proprietario";

  useEffect(() => {
    if (!empresa?.empresa_id || !isProprietario || destinatario !== "user") {
      if (destinatario !== "user") {
        setCarregandoMembros(false);
      }
      if (!empresa?.empresa_id || !isProprietario) {
        setMembrosOptions([]);
      }
      return;
    }

    let ativo = true;
    setCarregandoMembros(true);

    async function carregarMembros() {
      try {
        const { data: membros, error: membrosError } = await supabase
          .from("membros_empresa")
          .select("usuario_id")
          .eq("empresa_id", empresa?.empresa_id)
          .eq("ativo", true);

        if (membrosError) throw membrosError;

        const usuarioIds = (membros ?? [])
          .map((item) => item.usuario_id)
          .filter((id): id is string => Boolean(id));

        if (!usuarioIds.length) {
          if (ativo) {
            setMembrosOptions([]);
          }
          return;
        }

        const { data: usuariosData, error: usuariosError } = await supabase.rpc(
          "listar_usuarios"
        );

        if (usuariosError) throw usuariosError;

        const usuarios = (usuariosData ?? []) as Array<{
          id: string;
          email: string | null;
          name: string | null;
        }>;

        const usuariosMap = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

        const options = usuarioIds
          .map((id) => {
            const usuario = usuariosMap.get(id);
            if (!usuario) {
              return {
                id,
                label: id,
                email: null,
                name: null,
              } satisfies MembroOption;
            }

            const label = usuario.name?.trim() || usuario.email?.trim() || id;
            return {
              id,
              label,
              email: usuario.email,
              name: usuario.name,
            } satisfies MembroOption;
          })
          .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));

        if (ativo) {
          setMembrosOptions(options);
        }
      } catch (error) {
        console.error("[Notificacoes] Erro ao carregar membros:", error);
        if (ativo) {
          setMembrosOptions([]);
          mostrarToast({
            titulo: "Erro",
            mensagem: "Não foi possível carregar os membros da empresa.",
            tipo: "error",
          });
        }
      } finally {
        if (ativo) {
          setCarregandoMembros(false);
        }
      }
    }

    carregarMembros();

    return () => {
      ativo = false;
    };
  }, [destinatario, empresa?.empresa_id, isProprietario, mostrarToast]);

  useEffect(() => {
    if (userId && !membrosOptions.some((option) => option.id === userId)) {
      setUserId("");
    }
  }, [membrosOptions, userId]);

  const envioDesabilitado =
    enviando ||
    (destinatario === "user" && (carregandoMembros || !userId || membrosOptions.length === 0));

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
            onClick={() => router.push("/notificacoes")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar para Notificações
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

    if (enviandoRef.current) {
      mostrarToast({
        titulo: "Aviso",
        mensagem: "Uma notificação já está sendo enviada.",
        tipo: "warning",
      });
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const remetente = sessionData.session?.user;
      if (sessionError || !remetente) {
        throw new Error("Sessão inválida ou expirada");
      }

      const nowIso = new Date().toISOString();
      const salvarNotificacao = async (destinatarios: string[] | null, destino: "todos" | "user") => {
        const payload = {
          titulo,
          mensagem,
          tipo: "info",
          destinatario_id: destinatarios && destinatarios.length > 0 ? destinatarios : null,
          remetente_id: remetente.id,
          enviado: true,
          enviado_em: nowIso,
          data: {
            origem: "painel_admin",
            destino,
            empresa_id: empresa?.empresa_id ?? null,
            destinatario_count: destinatarios?.length ?? null,
          },
        } satisfies Partial<Database["public"]["Tables"]["notificacoes"]["Insert"]>;

        const { error } = await supabase.from("notificacoes").insert(payload);
        if (error) {
          throw error;
        }
      };

      if (destinatario === "todos") {
        const { data: membros, error: membrosError } = await supabase
          .from("membros_empresa")
          .select("usuario_id")
          .eq("empresa_id", empresa?.empresa_id)
          .eq("ativo", true);

        if (membrosError) throw membrosError;
        const usuariosUnicos = Array.from(
          new Set((membros ?? []).map((m) => m.usuario_id).filter((id): id is string => Boolean(id)))
        );

        if (!usuariosUnicos.length) throw new Error("Nenhum membro ativo encontrado.");

        await salvarNotificacao(usuariosUnicos, "todos");

        mostrarToast({
          titulo: "Envio concluído",
          mensagem: `${usuariosUnicos.length} destinatários registrados para a notificação.`,
          tipo: "success",
        });
      } else {
        if (carregandoMembros) {
          mostrarToast({
            titulo: "Aviso",
            mensagem: "Aguarde o carregamento dos membros antes de enviar.",
            tipo: "warning",
          });
          return;
        }
        if (!userId) {
          mostrarToast({
            titulo: "Erro",
            mensagem: "Selecione o usuário destinatário",
            tipo: "error",
          });
          return;
        }
        await salvarNotificacao([userId], "user");
        mostrarToast({
          titulo: "Sucesso!",
          mensagem: "Notificação registrada para o usuário selecionado.",
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
      enviandoRef.current = false;
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
              Selecionar membro
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={carregandoMembros || enviando || membrosOptions.length === 0}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {carregandoMembros
                  ? "Carregando membros..."
                  : membrosOptions.length === 0
                    ? "Nenhum membro disponível"
                    : "Selecione um membro"}
              </option>
              {membrosOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {!carregandoMembros && membrosOptions.length === 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Não encontramos membros ativos para a empresa.
              </p>
            )}
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
          disabled={envioDesabilitado}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-lg transition ${
            envioDesabilitado
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
