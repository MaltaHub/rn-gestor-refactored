"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "info" | "success" | "warning" | "error";
  lida: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "nao_lidas">("todas");
  const router = useRouter();

  useEffect(() => {
    carregarNotificacoes();

    // Realtime subscription
    const channel = supabase
      .channel("notificacoes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
        },
        () => {
          carregarNotificacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function carregarNotificacoes() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      let query = supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filter === "nao_lidas") {
        query = query.eq("lida", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      setNotificacoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLida(id: string) {
    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", id);

      if (error) throw error;

      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  }

  async function marcarTodasComoLidas() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("user_id", user.id)
        .eq("lida", false);

      if (error) throw error;

      carregarNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  }

  async function deletarNotificacao(id: string) {
    try {
      const { error } = await supabase
        .from("notificacoes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  }

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notificações
          </h1>
          <Link
            href="/admin/notificacoes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enviar Notificação
          </Link>
          {naoLidasCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {naoLidasCount} não {naoLidasCount === 1 ? "lida" : "lidas"}
            </p>
          )}
        </div>

        {naoLidasCount > 0 && (
          <button
            onClick={marcarTodasComoLidas}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("todas")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "todas"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter("nao_lidas")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "nao_lidas"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Não lidas {naoLidasCount > 0 && `(${naoLidasCount})`}
        </button>
      </div>

      {/* Lista de notificações */}
      {notificacoes.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {filter === "nao_lidas"
              ? "Nenhuma notificação não lida"
              : "Você não tem notificações"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((notificacao) => (
            <NotificacaoItem
              key={notificacao.id}
              notificacao={notificacao}
              onMarcarLida={marcarComoLida}
              onDeletar={deletarNotificacao}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificacaoItem({
  notificacao,
  onMarcarLida,
  onDeletar,
}: {
  notificacao: Notificacao;
  onMarcarLida: (id: string) => void;
  onDeletar: (id: string) => void;
}) {
  const iconConfig = {
    info: { icon: Info, color: "text-blue-500" },
    success: { icon: CheckCircle, color: "text-green-500" },
    warning: { icon: AlertTriangle, color: "text-yellow-500" },
    error: { icon: AlertCircle, color: "text-red-500" },
  };

  const { icon: Icon, color } = iconConfig[notificacao.tipo];

  return (
    <div
      className={`
        p-4 rounded-lg border transition-colors
        ${
          notificacao.lida
            ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">
            {notificacao.titulo}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notificacao.mensagem}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {new Date(notificacao.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          {!notificacao.lida && (
            <button
              onClick={() => onMarcarLida(notificacao.id)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Marcar como lida"
            >
              <Check className="w-4 h-4 text-green-600" />
            </button>
          )}
          <button
            onClick={() => onDeletar(notificacao.id)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
