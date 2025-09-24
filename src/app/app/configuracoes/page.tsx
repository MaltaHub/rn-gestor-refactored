"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCcw, Save, Trash2, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cadastrosService } from "@/lib/services/domains";
import type { CadastroContexto, CadastroItem, ModeloDetalhe } from "@/types/domain";

type CadastroTipo = CadastroContexto["tipo"];
type CadastroMapa = Partial<Record<CadastroTipo, CadastroItem[]>>;

interface SimpleManagerProps {
  tipo: CadastroTipo;
  title: string;
  description: string;
  items: CadastroItem[];
  emptyMessage: string;
  placeholder: string;
  isLoading: boolean;
  onCreate: (nome: string) => Promise<void>;
  onUpdate: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

interface ModeloFormState {
  id?: string;
  marca: string;
  nome: string;
  versao: string;
  anoInicial: string;
  anoFinal: string;
  ativo: boolean;
}

const emptyModelo: ModeloFormState = {
  marca: "",
  nome: "",
  versao: "",
  anoInicial: "",
  anoFinal: "",
  ativo: true
};

export default function SettingsPage() {
  const [contextos, setContextos] = useState<CadastroContexto[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<CadastroTipo>("stores");
  const [itensPorTipo, setItensPorTipo] = useState<CadastroMapa>({});
  const [carregandoContextos, setCarregandoContextos] = useState(true);
  const [carregandoTipos, setCarregandoTipos] = useState<Partial<Record<CadastroTipo, boolean>>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const [listaModelos, setListaModelos] = useState<CadastroItem[]>([]);
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState<string | null>(null);
  const [modeloForm, setModeloForm] = useState<ModeloFormState>(emptyModelo);
  const [carregandoModeloDetalhe, setCarregandoModeloDetalhe] = useState(false);
  const [processandoModelo, setProcessandoModelo] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const dados = await cadastrosService.listarContextos();
        if (!ativo) return;
        setContextos(dados);
        if (dados.length > 0) {
          setAbaAtiva(dados[0].tipo);
        }
      } catch (error) {
        console.error("Falha ao carregar contextos de cadastro", error);
        setFeedback("Não foi possível carregar os contextos de cadastro.");
      } finally {
        if (ativo) {
          setCarregandoContextos(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!abaAtiva) return;
    if (abaAtiva === "models") {
      void carregarModelos();
    } else {
      void carregarItensSimples(abaAtiva);
    }
  }, [abaAtiva]);

  const carregarItensSimples = async (tipo: CadastroTipo) => {
    setCarregandoTipos((estado) => ({ ...estado, [tipo]: true }));
    try {
      const dados = await cadastrosService.listarCadastros(tipo);
      setItensPorTipo((prev) => ({ ...prev, [tipo]: dados }));
    } catch (error) {
      console.error(`Falha ao carregar cadastros para ${tipo}`, error);
      setFeedback("Não foi possível carregar os cadastros solicitados.");
    } finally {
      setCarregandoTipos((estado) => ({ ...estado, [tipo]: false }));
    }
  };

  const carregarModelos = async () => {
    const tipo: CadastroTipo = "models";
    setCarregandoTipos((estado) => ({ ...estado, [tipo]: true }));
    try {
      const dados = await cadastrosService.listarCadastros("models");
      setListaModelos(dados);
      if (dados.length === 0) {
        setModeloSelecionadoId(null);
        setModeloForm(emptyModelo);
      }
    } catch (error) {
      console.error("Falha ao carregar modelos", error);
      setFeedback("Não foi possível carregar os modelos cadastrados.");
    } finally {
      setCarregandoTipos((estado) => ({ ...estado, [tipo]: false }));
    }
  };

  const carregarDetalheModelo = async (id: string) => {
    setCarregandoModeloDetalhe(true);
    try {
      const detalhe = await cadastrosService.detalharModelo(id);
      if (!detalhe) {
        setFeedback("Modelo não encontrado para edição.");
        return;
      }
      setModeloSelecionadoId(id);
      setModeloForm({
        id: detalhe.id,
        marca: detalhe.marca ?? "",
        nome: detalhe.nome ?? "",
        versao: detalhe.versao ?? "",
        anoInicial: detalhe.anoInicial ? String(detalhe.anoInicial) : "",
        anoFinal: detalhe.anoFinal ? String(detalhe.anoFinal) : "",
        ativo: Boolean(detalhe.ativo)
      });
    } catch (error) {
      console.error("Erro ao detalhar modelo", error);
      setFeedback("Não foi possível carregar os detalhes do modelo.");
    } finally {
      setCarregandoModeloDetalhe(false);
    }
  };

  const handleCreateSimple = (tipo: CadastroTipo) => async (nome: string) => {
    if (!nome.trim()) return;
    setFeedback(null);
    try {
      await cadastrosService.salvarCadastro(tipo, { nome: nome.trim() });
      await carregarItensSimples(tipo);
      setFeedback("Item cadastrado com sucesso.");
    } catch (error) {
      console.error("Erro ao criar item de cadastro", error);
      setFeedback("Não foi possível criar o item.");
    }
  };

  const handleUpdateSimple = (tipo: CadastroTipo) => async (id: string, nome: string) => {
    if (!nome.trim()) return;
    setFeedback(null);
    try {
      await cadastrosService.salvarCadastro(tipo, { id, nome: nome.trim() });
      await carregarItensSimples(tipo);
      setFeedback("Cadastro atualizado.");
    } catch (error) {
      console.error("Erro ao atualizar cadastro", error);
      setFeedback("Não foi possível atualizar o item selecionado.");
    }
  };

  const handleDeleteSimple = (tipo: CadastroTipo) => async (id: string) => {
    setFeedback(null);
    try {
      await cadastrosService.excluirCadastro(tipo, id);
      await carregarItensSimples(tipo);
      setFeedback("Item removido do cadastro.");
    } catch (error) {
      console.error("Erro ao remover item de cadastro", error);
      setFeedback("Não foi possível remover o item selecionado.");
    }
  };

  const handleNovoModelo = () => {
    setModeloSelecionadoId(null);
    setModeloForm(emptyModelo);
  };

  const handleAtualizarModelo = (campo: keyof ModeloFormState, valor: string | boolean) => {
    setModeloForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const handleSalvarModelo = async () => {
    setProcessandoModelo(true);
    setFeedback(null);
    try {
      const payload: Partial<ModeloDetalhe> = {
        marca: modeloForm.marca || undefined,
        nome: modeloForm.nome || undefined,
        versao: modeloForm.versao || undefined,
        anoInicial: modeloForm.anoInicial ? Number(modeloForm.anoInicial) : undefined,
        anoFinal: modeloForm.anoFinal ? Number(modeloForm.anoFinal) : undefined,
        ativo: modeloForm.ativo
      };
      if (modeloSelecionadoId) {
        await cadastrosService.atualizarModelo(modeloSelecionadoId, payload);
        await carregarModelos();
        if (modeloSelecionadoId) {
          await carregarDetalheModelo(modeloSelecionadoId);
        }
        setFeedback("Modelo atualizado com sucesso.");
      } else {
        const resultado = await cadastrosService.criarModelo(payload);
        await carregarModelos();
        if (resultado?.id) {
          await carregarDetalheModelo(resultado.id);
        }
        setFeedback("Modelo criado e pronto para integração.");
      }
    } catch (error) {
      console.error("Erro ao salvar modelo", error);
      setFeedback("Não foi possível salvar o modelo. Verifique os dados informados.");
    } finally {
      setProcessandoModelo(false);
    }
  };

  const handleRemoverModelo = async () => {
    if (!modeloSelecionadoId) return;
    setProcessandoModelo(true);
    setFeedback(null);
    try {
      await cadastrosService.removerModelo(modeloSelecionadoId);
      setModeloSelecionadoId(null);
      setModeloForm(emptyModelo);
      await carregarModelos();
      setFeedback("Modelo removido com sucesso.");
    } catch (error) {
      console.error("Erro ao remover modelo", error);
      setFeedback("Não foi possível remover o modelo selecionado.");
    } finally {
      setProcessandoModelo(false);
    }
  };

  const itensAtuais = (tipo: CadastroTipo) => itensPorTipo[tipo] ?? [];

  const simpleManagers = useMemo(() => {
    return contextos.filter((ctx) => ctx.tipo !== "models");
  }, [contextos]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cadastros operacionais"
        description="Centralize dados mestres diretamente conectados aos serviços de leitura e escrita."
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => (abaAtiva === "models" ? carregarModelos() : carregarItensSimples(abaAtiva))}
            disabled={carregandoContextos}
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar lista
          </Button>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <div className="flex flex-wrap gap-2">
        {contextos.map((contexto) => (
          <Button
            key={contexto.tipo}
            variant={abaAtiva === contexto.tipo ? "default" : "ghost"}
            className="gap-2"
            onClick={() => setAbaAtiva(contexto.tipo)}
          >
            {contexto.label}
          </Button>
        ))}
      </div>

      {carregandoContextos ? (
        <p className="text-sm text-slate-400">Carregando contextos de cadastro...</p>
      ) : null}

      <div className="space-y-6">
        {simpleManagers
          .filter((manager) => manager.tipo === abaAtiva)
          .map((manager) => (
            <SimpleManager
              key={manager.tipo}
              tipo={manager.tipo}
              title={manager.label}
              description={`Gerencie o contexto de ${manager.label.toLowerCase()} com integrações prontas.`}
              items={itensAtuais(manager.tipo)}
              emptyMessage={`Nenhum registro encontrado em ${manager.label.toLowerCase()}.`}
              placeholder={`Novo item em ${manager.label.toLowerCase()}`}
              isLoading={Boolean(carregandoTipos[manager.tipo])}
              onCreate={handleCreateSimple(manager.tipo)}
              onUpdate={handleUpdateSimple(manager.tipo)}
              onDelete={handleDeleteSimple(manager.tipo)}
              onRefresh={() => carregarItensSimples(manager.tipo)}
            />
          ))}
      </div>

      {abaAtiva === "models" ? (
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle>Modelos</CardTitle>
            <CardDescription>
              Operações conectadas a `modelos.detalhes`, `modelos.criar`, `modelos.atualizar` e `modelos.remover`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Modelos cadastrados</p>
                <Button size="sm" className="gap-2" onClick={handleNovoModelo}>
                  <Plus className="h-4 w-4" />
                  Novo modelo
                </Button>
              </div>
              <div className="space-y-2">
                {listaModelos.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => carregarDetalheModelo(item.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                      modeloSelecionadoId === item.id
                        ? "border-sky-400/60 bg-sky-400/10 text-slate-100"
                        : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-sky-400/40"
                    }`}
                  >
                    <span className="font-medium text-white">{item.nome}</span>
                    <span className="block text-xs text-slate-400">{item.descricao ?? "Modelo cadastrado"}</span>
                  </button>
                ))}
                {listaModelos.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum modelo cadastrado até o momento.</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              {carregandoModeloDetalhe ? (
                <p className="text-sm text-slate-400">Carregando detalhes do modelo...</p>
              ) : (
                <>
                  <div className="grid gap-3">
                    <label className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-200">Marca</span>
                      <Input
                        value={modeloForm.marca}
                        onChange={(event) => handleAtualizarModelo("marca", event.target.value)}
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-200">Modelo</span>
                      <Input
                        value={modeloForm.nome}
                        onChange={(event) => handleAtualizarModelo("nome", event.target.value)}
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-200">Versão</span>
                      <Input
                        value={modeloForm.versao}
                        onChange={(event) => handleAtualizarModelo("versao", event.target.value)}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-200">Ano inicial</span>
                        <Input
                          value={modeloForm.anoInicial}
                          onChange={(event) => handleAtualizarModelo("anoInicial", event.target.value)}
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-200">Ano final</span>
                        <Input
                          value={modeloForm.anoFinal}
                          onChange={(event) => handleAtualizarModelo("anoFinal", event.target.value)}
                        />
                      </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={modeloForm.ativo}
                        onChange={(event) => handleAtualizarModelo("ativo", event.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                      />
                      <span className="font-semibold text-slate-200">Modelo ativo</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button className="gap-2" onClick={handleSalvarModelo} disabled={processandoModelo}>
                      <Save className="h-4 w-4" />
                      {processandoModelo ? "Salvando..." : "Salvar modelo"}
                    </Button>
                    {modeloSelecionadoId ? (
                      <Button
                        variant="ghost"
                        className="gap-2 text-red-300 hover:bg-red-500/10"
                        onClick={handleRemoverModelo}
                        disabled={processandoModelo}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SimpleManager({
  tipo,
  title,
  description,
  items,
  emptyMessage,
  placeholder,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh
}: SimpleManagerProps) {
  const [novoValor, setNovoValor] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.nome.localeCompare(b.nome)), [items]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!novoValor.trim()) return;
    setIsProcessing(true);
    try {
      await onCreate(novoValor.trim());
      setNovoValor("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingValue.trim()) return;
    setIsProcessing(true);
    try {
      await onUpdate(editingId, editingValue.trim());
      setEditingId(null);
      setEditingValue("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await onDelete(id);
      if (editingId === id) {
        setEditingId(null);
        setEditingValue("");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <Card className="border-white/10 bg-slate-900/70">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-2" onClick={onRefresh} disabled={isLoading || isProcessing}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-400">Carregando dados de {title.toLowerCase()}...</p>
        ) : (
          <div className="space-y-3">
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editingId === item.id ? (
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                      <Input
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                        placeholder={placeholder}
                        disabled={isProcessing}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2" onClick={handleSaveEdit} disabled={isProcessing}>
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={cancelEdit} disabled={isProcessing}>
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-white">{item.nome}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditingValue(item.nome);
                          }}
                          disabled={isProcessing}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(item.id)}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">{emptyMessage}</p>
            )}
          </div>
        )}

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCreate}>
          <Input
            value={novoValor}
            onChange={(event) => setNovoValor(event.target.value)}
            placeholder={placeholder}
            disabled={isProcessing || isLoading}
          />
          <Button type="submit" className="gap-2" disabled={isProcessing || isLoading}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
