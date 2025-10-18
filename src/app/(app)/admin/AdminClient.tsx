"use client";

import { useMemo, useState } from "react";
import {
  useAdminMembros,
  useAdminUsuarios,
  useSalvarEmpresaDoUsuario,
  useRemoverEmpresaDoUsuario,
  useAtualizarPapelMembro,
  useAtualizarStatusMembro,
} from "@/hooks/use-admin";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  User,
  Eye,
  MoreVertical,
  Trash2,
  X,
  CheckCircle2,
  Mail,
  AlertCircle,
} from "lucide-react";

type FeedbackState = { type: "success" | "error"; message: string } | null;
type ModalState = "invite" | "edit" | null;

const PAPEL_LABELS = {
  proprietario: { label: "Proprietário", icon: Crown, color: "text-purple-600 bg-purple-50 border-purple-200" },
  administrador: { label: "Administrador", icon: Shield, color: "text-blue-600 bg-blue-50 border-blue-200" },
  gerente: { label: "Gerente", icon: Users, color: "text-green-600 bg-green-50 border-green-200" },
  consultor: { label: "Consultor", icon: Eye, color: "text-orange-600 bg-orange-50 border-orange-200" },
  usuario: { label: "Usuário", icon: User, color: "text-gray-600 bg-gray-50 border-gray-200" },
};

export default function AdminClient() {
  const { data: membroAtual, isLoading: isLoadingMembroAtual } = useEmpresaDoUsuario();
  const { data: membros = [], isLoading: isLoadingMembros } = useAdminMembros();
  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useAdminUsuarios();

  const salvarEmpresa = useSalvarEmpresaDoUsuario();
  const removerEmpresa = useRemoverEmpresaDoUsuario();
  const atualizarPapel = useAtualizarPapelMembro();
  const atualizarStatus = useAtualizarStatusMembro();

  const [modalState, setModalState] = useState<ModalState>(null);
  const [selectedMembro, setSelectedMembro] = useState<typeof membros[number] | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePapel, setInvitePapel] = useState<keyof typeof PAPEL_LABELS>("usuario");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const empresaId = membroAtual?.empresa_id;

  const membrosPorUsuario = useMemo(() => {
    const map = new Map<string, typeof membros[number]>();
    membros.forEach((membro) => {
      if (membro.usuario_id) {
        map.set(membro.usuario_id, membro);
      }
    });
    return map;
  }, [membros]);

  const usuariosComVinculo = useMemo(() => {
    return usuarios.map((usuario) => ({
      usuario,
      membro: membrosPorUsuario.get(usuario.id) ?? null,
    }));
  }, [usuarios, membrosPorUsuario]);

  const membrosAtivos = useMemo(() => {
    return usuariosComVinculo.filter(({ membro }) =>
      membro && membro.empresa_id === empresaId && membro.ativo !== false
    );
  }, [usuariosComVinculo, empresaId]);

  const handleInviteMembro = async () => {
    if (!inviteEmail.trim()) {
      setFeedback({ type: "error", message: "Por favor, informe o e-mail do usuário" });
      return;
    }

    const usuario = usuarios.find(u => u.email?.toLowerCase() === inviteEmail.toLowerCase());

    if (!usuario) {
      setFeedback({ type: "error", message: "Usuário não encontrado no sistema" });
      return;
    }

    const membroExistente = membrosPorUsuario.get(usuario.id);
    if (membroExistente && membroExistente.empresa_id === empresaId) {
      setFeedback({ type: "error", message: "Este usuário já é membro da equipe" });
      return;
    }

    if (!empresaId) {
      setFeedback({ type: "error", message: "Empresa não identificada" });
      return;
    }

    salvarEmpresa.mutate(
      {
        usuarioId: usuario.id,
        empresaId,
        papel: invitePapel,
      },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Membro adicionado com sucesso!" });
          setModalState(null);
          setInviteEmail("");
          setInvitePapel("usuario");
        },
        onError: (error) => {
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Erro ao adicionar membro"
          });
        },
      }
    );
  };

  const handleChangePapel = (membroId: string, novoPapel: keyof typeof PAPEL_LABELS) => {
    atualizarPapel.mutate(
      { membroId, papel: novoPapel },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Papel atualizado com sucesso!" });
          setModalState(null);
          setMenuOpenFor(null);
        },
        onError: (error) => {
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Erro ao atualizar papel"
          });
        },
      }
    );
  };

  const handleToggleStatus = (membroId: string, ativo: boolean) => {
    atualizarStatus.mutate(
      { membroId, ativo },
      {
        onSuccess: () => {
          setFeedback({
            type: "success",
            message: ativo ? "Membro ativado com sucesso!" : "Membro desativado com sucesso!"
          });
          setMenuOpenFor(null);
        },
        onError: (error) => {
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Erro ao atualizar status"
          });
        },
      }
    );
  };

  const handleRemoveMembro = (membroId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro da equipe?")) return;

    removerEmpresa.mutate(membroId, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Membro removido com sucesso!" });
        setMenuOpenFor(null);
      },
      onError: (error) => {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro ao remover membro"
        });
      },
    });
  };

  if (isLoadingMembroAtual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!membroAtual || !["proprietario", "administrador"].includes(membroAtual.papel ?? "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar o gerenciador de equipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Gerenciador de Equipe
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gerencie os membros da sua equipe, altere funções e convide novos colaboradores
              </p>
            </div>
            <button
              onClick={() => setModalState("invite")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              Convidar Membro
            </button>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-6 rounded-lg p-4 flex items-start gap-3 ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="flex-1">{feedback.message}</p>
            <button onClick={() => setFeedback(null)} className="hover:opacity-70">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Membros</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {membrosAtivos.length}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administradores</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {membrosAtivos.filter(({ membro }) =>
                    membro?.papel === "administrador" || membro?.papel === "proprietario"
                  ).length}
                </p>
              </div>
              <Shield className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {membrosAtivos.filter(({ membro }) => membro?.ativo !== false).length}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Membros da Equipe</h2>
          </div>

          {isLoadingMembros || isLoadingUsuarios ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando membros...</p>
            </div>
          ) : membrosAtivos.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhum membro na equipe ainda</p>
              <button
                onClick={() => setModalState("invite")}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Primeiro Membro
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {membrosAtivos.map(({ usuario, membro }) => {
                if (!membro) return null;

                const papelInfo = PAPEL_LABELS[membro.papel ?? "usuario"];
                const IconPapel = papelInfo.icon;

                return (
                  <div
                    key={membro.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                          {(usuario.name?.[0] || usuario.email?.[0] || "U").toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {usuario.name || usuario.email || "Usuário sem nome"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {usuario.email || "Sem e-mail"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${papelInfo.color}`}>
                            <IconPapel className="w-4 h-4" />
                            {papelInfo.label}
                          </div>

                          {membro.ativo === false && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>

                      {membro.usuario_id !== membroAtual.usuario_id && (
                        <div className="relative ml-4">
                          <button
                            onClick={() => setMenuOpenFor(menuOpenFor === membro.id ? null : membro.id)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          {menuOpenFor === membro.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setSelectedMembro(membro);
                                    setModalState("edit");
                                    setMenuOpenFor(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Alterar Papel
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(membro.id, !membro.ativo)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {membro.ativo === false ? "Ativar" : "Desativar"} Membro
                                </button>
                                <button
                                  onClick={() => handleRemoveMembro(membro.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remover da Equipe
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Convidar */}
      {modalState === "invite" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Convidar Novo Membro
              </h3>
              <button
                onClick={() => setModalState(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-mail do usuário
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Papel na equipe
                </label>
                <select
                  value={invitePapel}
                  onChange={(e) => setInvitePapel(e.target.value as keyof typeof PAPEL_LABELS)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(PAPEL_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalState(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInviteMembro}
                  disabled={salvarEmpresa.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvarEmpresa.isPending ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Papel */}
      {modalState === "edit" && selectedMembro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alterar Papel do Membro
              </h3>
              <button
                onClick={() => {
                  setModalState(null);
                  setSelectedMembro(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(PAPEL_LABELS).map(([key, { label, icon: Icon, color }]) => (
                <button
                  key={key}
                  onClick={() => handleChangePapel(selectedMembro.id, key as keyof typeof PAPEL_LABELS)}
                  disabled={atualizarPapel.isPending}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedMembro.papel === key
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                  </div>
                  {selectedMembro.papel === key && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
