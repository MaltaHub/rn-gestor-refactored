"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import {
  Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

type NotificacaoRow = Database["public"]["Tables"]["notificacoes"]["Row"];
type NotificacaoLeituraRow = Database["public"]["Tables"]["notificacoes_leituras"]["Row"];

interface Notificacao extends NotificacaoRow {
  lida?: boolean;
  arquivado?: boolean;
}

type FilterType = "todas" | "nao_lidas" | "arquivadas";

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoadingNotificacoes, setIsLoadingNotificacoes] = useState(true);
  const [filter, setFilter] = useState<FilterType>("todas");

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  // Carregar notificações + leituras do usuário
  const carregarNotificacoes = useCallback(async () => {
    if (!userId) return;

    setIsLoadingNotificacoes(true);
    try {
      const [notificacoesRes, leiturasRes] = await Promise.all([
        supabase.from("notificacoes").select("*").order("created_at", { ascending: false }),
        supabase.from("notificacoes_leituras").select("*").eq("user_id", userId),
      ]);

      if (notificacoesRes.error) throw notificacoesRes.error;
      if (leiturasRes.error) throw leiturasRes.error;

      const todas = notificacoesRes.data || [];
      const leituras = leiturasRes.data || [];

      // merge notificações + leituras
      const notificacoesComStatus: Notificacao[] = todas.map((n) => {
        const leitura = leituras.find((l: NotificacaoLeituraRow) => l.notificacao_id === n.id);
        return {
          ...n,
          lida: !!leitura?.lido_em,
          arquivado: leitura?.arquivado ?? false,
        };
      });

      // filtrar conforme a aba selecionada
      let filtradas: Notificacao[] = [];
      switch (filter) {
        case "nao_lidas":
          filtradas = notificacoesComStatus.filter((n) => !n.lida);
          break;
        case "arquivadas":
          filtradas = notificacoesComStatus.filter((n) => n.arquivado);
          break;
        default:
          filtradas = notificacoesComStatus.filter((n) => !n.arquivado);
      }

      setNotificacoes(filtradas);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setIsLoadingNotificacoes(false);
    }
  }, [filter, userId]);

  // Buscar user só uma vez
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      router.push("/login");
      return;
    }

    carregarNotificacoes();

    const channel = supabase
      .channel("notificacoes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes" },
        () => {
          carregarNotificacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, userId, router, carregarNotificacoes]);

  // Marcar notificação como lida
  const marcarComoLida = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      // Verifica se já existe um registro
      const { data: existing } = await supabase
        .from("notificacoes_leituras")
        .select("id")
        .eq("notificacao_id", id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Atualiza o registro existente
        await supabase
          .from("notificacoes_leituras")
          .update({ lido_em: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        // Cria um novo registro
        await supabase.from("notificacoes_leituras").insert({
          notificacao_id: id,
          user_id: userId,
          lido_em: new Date().toISOString(),
        });
      }

      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  }, [userId]);

  // Arquivar notificação
  const arquivarNotificacao = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      // Verifica se já existe um registro
      const { data: existing } = await supabase
        .from("notificacoes_leituras")
        .select("id")
        .eq("notificacao_id", id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Atualiza o registro existente
        await supabase
          .from("notificacoes_leituras")
          .update({
            arquivado: true,
            arquivado_em: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Cria um novo registro
        await supabase.from("notificacoes_leituras").insert({
          notificacao_id: id,
          user_id: userId,
          arquivado: true,
          arquivado_em: new Date().toISOString(),
        });
      }

      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Erro ao arquivar:", error);
    }
  }, [userId]);

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notificações
          </h1>
          <Link
            href="/notificacoes/enviar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-2"
          >
            Enviar Notificação
          </Link>
          {naoLidasCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {naoLidasCount} não {naoLidasCount === 1 ? "lida" : "lidas"}
            </p>
          )}
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 mb-6">
        {(["todas", "nao_lidas", "arquivadas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {f === "todas" ? "Todas" : f === "nao_lidas" ? "Não lidas" : "Arquivadas"}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {authLoading || isLoadingNotificacoes ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : notificacoes.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {filter === "nao_lidas"
              ? "Nenhuma notificação não lida"
              : filter === "arquivadas"
              ? "Nenhuma notificação arquivada"
              : "Você não tem notificações"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <NotificacaoItem
              key={n.id}
              notificacao={n}
              onMarcarLida={marcarComoLida}
              onArquivar={arquivarNotificacao}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NotificacaoItemProps {
  notificacao: Notificacao;
  onMarcarLida: (id: string) => void;
  onArquivar: (id: string) => void;
}

function NotificacaoItem({
  notificacao,
  onMarcarLida,
  onArquivar,
}: NotificacaoItemProps) {
  const tipoNotificacao = (notificacao.tipo || "info") as "info" | "success" | "warning" | "error";

  const icons = {
    info: { icon: Info, color: "text-blue-500" },
    success: { icon: CheckCircle, color: "text-green-500" },
    warning: { icon: AlertTriangle, color: "text-yellow-500" },
    error: { icon: AlertCircle, color: "text-red-500" },
  };

  const { icon: Icon, color } = icons[tipoNotificacao];

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        notificacao.lida
          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      }`}
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
            onClick={() => onArquivar(notificacao.id)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Arquivar"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
