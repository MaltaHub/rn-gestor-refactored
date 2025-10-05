"use client";

import { useMemo, useState } from "react";

import {
  useAdminEmpresas,
  useAdminMembros,
  useAdminUsuarios,
  useSalvarEmpresaDoUsuario,
  useRemoverEmpresaDoUsuario,
} from "@/hooks/use-admin";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import type { UsuarioListado } from "@/services/admin";

type FeedbackState = { type: "success" | "error"; message: string } | null;

export default function AdminClient() {
  const { data: membroAtual, isLoading: isLoadingMembroAtual } = useEmpresaDoUsuario();
  const { data: empresas = [], isLoading: isLoadingEmpresas } = useAdminEmpresas();
  const { data: membros = [], isLoading: isLoadingMembros } = useAdminMembros();
  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useAdminUsuarios();
  const salvarEmpresa = useSalvarEmpresaDoUsuario();
  const removerEmpresa = useRemoverEmpresaDoUsuario();

  const [usuarioEmAtualizacao, setUsuarioEmAtualizacao] = useState<string | null>(null);
  const [usuarioEmRemocao, setUsuarioEmRemocao] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const empresasOrdenadas = useMemo(
    () => [...empresas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [empresas],
  );

  const membrosPorUsuario = useMemo(() => {
    const map = new Map<string, typeof membros[number]>();
    membros.forEach((membro) => {
      if (membro.usuario_id) {
        map.set(membro.usuario_id, membro);
      }
    });
    return map;
  }, [membros]);

  const usuariosOrdenados = useMemo(() => {
    const sorted = [...usuarios];
    sorted.sort((a, b) => {
      const keyA = (a.email ?? a.name ?? a.id ?? "").toLocaleLowerCase("pt-BR");
      const keyB = (b.email ?? b.name ?? b.id ?? "").toLocaleLowerCase("pt-BR");
      return keyA.localeCompare(keyB, "pt-BR", { sensitivity: "base" });
    });
    return sorted;
  }, [usuarios]);

  type UsuarioComMembro = {
    usuario: UsuarioListado;
    membro: (typeof membros)[number] | null;
  };

  const usuariosComVinculo = useMemo<UsuarioComMembro[]>(() => {
    const lista = usuariosOrdenados.map((usuario) => ({
      usuario,
      membro: membrosPorUsuario.get(usuario.id) ?? null,
    }));

    const usuariosIds = new Set(usuariosOrdenados.map((usuario) => usuario.id));
    const membrosSemUsuario = membros.filter((membro) =>
      membro.usuario_id ? !usuariosIds.has(membro.usuario_id) : false,
    );
    if (membrosSemUsuario.length > 0) {
      membrosSemUsuario.forEach((membro) => {
        if (!membro.usuario_id) return;
        if (lista.some((item) => item.usuario.id === membro.usuario_id)) return;

        lista.push({
          usuario: {
            id: membro.usuario_id,
            email: membro.usuario_id,
            name: null,
            created_at: null,
          },
          membro,
        });
      });
    }

    return lista;
  }, [membros, membrosPorUsuario, usuariosOrdenados]);

  const nomeEmpresaPorId = useMemo(() => {
    const map = new Map<string, string>();
    for (const empresa of empresasOrdenadas) {
      map.set(empresa.id, empresa.nome);
    }
    return map;
  }, [empresasOrdenadas]);

  const handleEmpresaChange = ({
    usuarioId,
    membroId,
    empresaId,
    papel,
  }: {
    usuarioId: string;
    membroId: string | null;
    empresaId: string;
    papel?: typeof membros[number]["papel"];
  }) => {
    if (!empresaId) return;

    const membroAtual = membrosPorUsuario.get(usuarioId) ?? null;
    if (membroAtual && membroAtual.empresa_id === empresaId) return;

    setFeedback(null);
    setUsuarioEmAtualizacao(usuarioId);

    const payload = {
      usuarioId,
      membroId: membroId ?? membroAtual?.id ?? null,
      empresaId,
      papel: papel ?? membroAtual?.papel ?? "usuario",
    } as const;

    salvarEmpresa.mutate(payload, {
      onSuccess: () => {
        setFeedback({
          type: "success",
          message: "Empresa do usuário atualizada com sucesso.",
        });
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a empresa do usuário.";
        setFeedback({ type: "error", message });
      },
      onSettled: () => {
        setUsuarioEmAtualizacao(null);
      },
    });
  };

  const handleRemoverEmpresa = (usuarioId: string, membroId: string) => {
    setFeedback(null);
    setUsuarioEmRemocao(usuarioId);

    removerEmpresa.mutate(membroId, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Vínculo removido com sucesso." });
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Não foi possível remover o vínculo.";
        setFeedback({ type: "error", message });
      },
      onSettled: () => {
        setUsuarioEmRemocao(null);
      },
    });
  };

  if (isLoadingMembroAtual) {
    return (
      <div className="px-6 py-10">
        <p className="text-sm text-zinc-500">Carregando permissões...</p>
      </div>
    );
  }

  if (!membroAtual || membroAtual.papel !== "proprietario") {
    return (
      <div className="px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-700">
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm">
            Somente usuários com papel de proprietário podem acessar o painel administrativo.
          </p>
        </div>
      </div>
    );
  }

  const nenhumDadoCarregando = !isLoadingEmpresas && empresasOrdenadas.length === 0;
  const nenhumUsuarioDisponivel =
    !isLoadingUsuarios && usuariosComVinculo.length === 0;

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Visualize todas as empresas cadastradas, confira os usuários e altere a empresa de cada um conforme necessário.
        </p>
      </header>

      <section className="mx-auto mt-10 max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Empresas cadastradas</h2>
          {isLoadingEmpresas && (
            <span className="text-sm text-zinc-500">Carregando empresas...</span>
          )}
        </div>

        {nenhumDadoCarregando ? (
          <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
            Nenhuma empresa cadastrada no momento.
          </div>
        ) : isLoadingEmpresas ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-zinc-200" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {empresasOrdenadas.map((empresa) => (
              <li key={empresa.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-medium text-zinc-800">{empresa.nome}</h3>
                <dl className="mt-3 space-y-1 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-zinc-600">Domínio:</dt>
                    <dd>{empresa.dominio ?? "—"}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-zinc-600">Status:</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          empresa.ativo ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {empresa.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto mt-12 max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Usuários por empresa</h2>
          {isLoadingMembros && (
            <span className="text-sm text-zinc-500">Carregando usuários...</span>
          )}
        </div>

        {nenhumUsuarioDisponivel ? (
          <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Papel</th>
                  <th className="px-4 py-3">Empresa atual</th>
                  <th className="px-4 py-3">Alterar empresa</th>
                  <th className="px-4 py-3">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white text-zinc-700">
                {isLoadingUsuarios || isLoadingMembros
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-4 w-36 rounded bg-zinc-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-24 rounded bg-zinc-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-32 rounded bg-zinc-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-9 w-44 rounded bg-zinc-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-40 rounded bg-zinc-200" />
                        </td>
                      </tr>
                    ))
                  : usuariosComVinculo.map(({ usuario, membro }) => {
                    const empresaAtualNome = membro?.empresa_id
                      ? nomeEmpresaPorId.get(membro.empresa_id) ?? "—"
                      : "Sem empresa";

                    const usuarioNome = usuario.name?.trim();
                    const usuarioEmail = usuario.email?.trim();
                    const usuarioDisplay = usuarioNome || usuarioEmail || usuario.id;
                    const usuarioEmailDisplay = usuarioEmail ?? "Sem e-mail cadastrado";
                    const isUpdating =
                      usuarioEmAtualizacao === usuario.id && salvarEmpresa.isPending;

                    return (
                      <tr key={usuario.id} className="transition hover:bg-blue-50/40">
                        <td className="px-4 py-3 align-middle">
                          <div className="font-medium text-zinc-800">{usuarioDisplay}</div>
                          <div className="text-xs text-zinc-500">{usuarioEmailDisplay}</div>
                          <div className="text-xs text-zinc-400">ID interno: {usuario.id}</div>
                        </td>
                        <td className="px-4 py-3 align-middle capitalize">
                          {membro?.papel ?? "—"}
                          {membro?.ativo === false && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span className="text-sm text-zinc-700">{empresaAtualNome}</span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <select
                              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-56"
                              value={membro?.empresa_id ?? ""}
                              onChange={(event) =>
                                handleEmpresaChange({
                                  usuarioId: usuario.id,
                                  membroId: membro?.id ?? null,
                                  empresaId: event.target.value,
                                  papel: membro?.papel ?? undefined,
                                })
                              }
                              disabled={
                                isUpdating ||
                                empresasOrdenadas.length === 0 ||
                                (removerEmpresa.isPending && usuarioEmRemocao === usuario.id)
                              }
                            >
                              <option value="" disabled>
                                Selecione uma empresa
                              </option>
                              {empresasOrdenadas.map((empresa) => (
                                <option key={empresa.id} value={empresa.id}>
                                  {empresa.nome}
                                </option>
                              ))}
                            </select>
                            {membro?.id && (
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={() => handleRemoverEmpresa(usuario.id, membro.id)}
                                disabled={
                                  removerEmpresa.isPending && usuarioEmRemocao === usuario.id
                                }
                              >
                                {removerEmpresa.isPending && usuarioEmRemocao === usuario.id
                                  ? "Removendo..."
                                  : "Remover vínculo"}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-zinc-500">
                          {(() => {
                            const dataRegistro = membro?.criado_em ?? usuario.created_at;
                            return dataRegistro
                              ? `Criado em ${new Date(dataRegistro).toLocaleString("pt-BR")}`
                              : "Sem vínculo cadastrado";
                          })()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {feedback && (
          <div
            className={`mt-4 rounded-md border px-3 py-2 text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </section>
    </div>
  );
}
