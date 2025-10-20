"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/config";
import {
  useAddDocumentos,
  useDocumentacaoDetalhe,
  useDocumentosVeiculo,
  useRemoveDocumento,
  useCriarDocumentacao,
  useVeiculoBasico,
  type DocumentoItem,
} from "@/adapters/adaptador-documentacao";
import { useLojaStore } from "@/stores/useLojaStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Permission } from "@/types/rbac";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import { LojaSelector } from "@/components/LojaSelector";
import { Modal, ModalContent, ModalFooter } from "@/components/ui/modal";

function toTitle(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)([a-zã-ú])/g, (match) => match.toUpperCase());
}

type Props = {
  empresaId: string;
  veiculoId: string;
};

async function signedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.DOCUMENTOS_VEICULOS)
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

function identificarPreview(contentType: string | null | undefined) {
  if (!contentType) return "outro" as const;
  if (contentType.includes("pdf")) return "pdf" as const;
  if (contentType.startsWith("image/")) return "imagem" as const;
  if (contentType.startsWith("text/") || contentType === "application/json") return "texto" as const;
  return "outro" as const;
}

export function DocumentRepository({ empresaId, veiculoId }: Props) {
  const loja = useLojaStore((s) => s.lojaSelecionada);
  const { hasPermission, isAdmin } = usePermissions();
  const canUpload = hasPermission(Permission.DOCUMENTACAO_ANEXOS) || isAdmin();
  const canEditDocumentacao = hasPermission(Permission.DOCUMENTACAO_EDITAR) || isAdmin();
  const { data: documentos = [], isLoading } = useDocumentosVeiculo(empresaId, veiculoId);
  const { data: detalhes } = useDocumentacaoDetalhe(empresaId, veiculoId);
  const { data: veiculoBasico } = useVeiculoBasico(veiculoId);
  const mAdd = useAddDocumentos(empresaId, veiculoId);
  const mRemove = useRemoveDocumento(empresaId, veiculoId);
  const mCriarDocumentacao = useCriarDocumentacao(empresaId, veiculoId);

  const [tipo, setTipo] = useState<string>("outros");
  const [observacao, setObservacao] = useState<string>("");
  const [nomePersonalizado, setNomePersonalizado] = useState<string>("");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentoItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const documentoPathsKey = useMemo(
    () => documentos.map((d) => d.path).join("|"),
    [documentos]
  );

  const handleCriarDocumentacao = () => {
    if (mCriarDocumentacao.isPending) return;
    mCriarDocumentacao.mutate(undefined, {
      onSuccess: () => {
        setFeedback({
          type: "success",
          message: "Documentação criada. Você já pode atualizar os dados deste veículo.",
        });
      },
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setFeedback({ type: "error", message });
      },
    });
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        documentos.map(async (d) => [d.id, await signedUrl(d.path)] as const)
      );
      if (!alive) return;
      const obj: Record<string, string> = {};
      for (const [id, url] of entries) obj[id] = url;
      setUrls(obj);
    })();
    return () => {
      alive = false;
    };
  }, [documentos, documentoPathsKey]);

  const buildNomeFinal = (file: File) => {
    const sanitized = nomePersonalizado.trim();
    if (!sanitized) return file.name;
    const ext = file.name.includes(".") ? file.name.split(".").pop() : null;
    return ext ? `${sanitized}.${ext}` : sanitized;
  };

  const enviarArquivos = (files: File[]) => {
    if (!canUpload || !files.length) return;
    const arquivos = files.map((file) => new File([file], buildNomeFinal(file), { type: file.type }));
    mAdd.mutate(
      { files: arquivos, tipo, observacao, nomePersonalizado: nomePersonalizado.trim() || null },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Documento(s) enviados." });
          setNomePersonalizado("");
          setObservacao("");
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          setFeedback({ type: "error", message });
        },
      }
    );
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUpload) return;
    const files = Array.from(e.target.files || []);
    enviarArquivos(files);
    e.currentTarget.value = "";
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    if (Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
      setIsDragActive(true);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    if (Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
      event.preventDefault();
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    enviarArquivos(files);
  };

  const removerDocumento = (doc: DocumentoItem) => {
    mRemove.mutate(doc, {
      onSuccess: () => setFeedback({ type: "success", message: "Documento removido." }),
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setFeedback({ type: "error", message });
      },
    });
  };

  const veiculoNome = useMemo(() => {
    const modelo = detalhes?.veiculo?.modelo?.nome ?? veiculoBasico?.modelo?.nome;
    return modelo ?? "Modelo não informado";
  }, [detalhes?.veiculo?.modelo?.nome, veiculoBasico?.modelo?.nome]);

  const placa = (detalhes?.veiculo?.placa ?? veiculoBasico?.placa ?? "—").toUpperCase();
  const lojaNome = loja?.nome ?? detalhes?.loja?.nome ?? "Sem loja selecionada";
  const statusGeral = detalhes?.status_geral ?? "sem_status";
  const dataEntrada = detalhes?.data_entrada ? new Date(detalhes.data_entrada) : null;
  const dataTransferencia = detalhes?.data_transferencia ? new Date(detalhes.data_transferencia) : null;

  const formatBytes = (value: number | null | undefined) => {
    if (value == null || Number.isNaN(value)) return "—";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  };

  const abrirPreview = async (doc: DocumentoItem) => {
    setPreviewDoc(doc);
    setPreviewLoading(true);
    try {
      let url = urls[doc.id];
      if (!url) {
        url = await signedUrl(doc.path);
        setUrls((prev) => ({ ...prev, [doc.id]: url }));
      }
      setPreviewUrl(url);
    } catch (err: unknown) {
      console.error(err);
      setFeedback({ type: "error", message: "Não foi possível abrir o documento." });
    } finally {
      setPreviewLoading(false);
    }
  };

  const obterUrl = async (doc: DocumentoItem) => {
    if (urls[doc.id]) return urls[doc.id];
    const url = await signedUrl(doc.path);
    setUrls((prev) => ({ ...prev, [doc.id]: url }));
    return url;
  };

  const documentosOrdenados = useMemo(() => {
    return [...documentos].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
  }, [documentos]);

  const previewTipo = identificarPreview(previewDoc?.content_type);

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Documentos do veículo</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p><span className="font-medium">Veículo:</span> {veiculoNome}</p>
                <p><span className="font-medium">Placa:</span> {placa}</p>
                <p><span className="font-medium">Loja responsável:</span> {lojaNome}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                {dataEntrada && <span>Entrada: {dataEntrada.toLocaleDateString("pt-BR")}</span>}
                {dataTransferencia && <span>Transferência: {dataTransferencia.toLocaleDateString("pt-BR")}</span>}
                <Badge variant="info" size="sm" className="capitalize">
                  Status: {toTitle(statusGeral)}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/documentacao">← Voltar para documentações</Link>
              </Button>
              <div className="min-w-[260px]">
                <LojaSelector />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {documentos.length} documento(s)
              </div>
              {!detalhes && canEditDocumentacao && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCriarDocumentacao}
                  disabled={mCriarDocumentacao.isPending}
                >
                  {mCriarDocumentacao.isPending ? "Criando..." : "Iniciar documentação"}
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body className="space-y-4">
          {!detalhes && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              <p className="font-medium">Documentação ainda não foi iniciada.</p>
              {canEditDocumentacao ? (
                <p className="mt-1">
                  Utilize o botão <span className="font-semibold">“Iniciar documentação”</span> para
                  criar o registro e liberar a edição dos dados.
                </p>
              ) : (
                <p className="mt-1">
                  Solicite a um responsável com permissão para iniciar a documentação deste veículo.
                </p>
              )}
            </div>
          )}
          <PermissionGuard permission={Permission.DOCUMENTACAO_ANEXOS}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tipo do documento</label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  {["crlv","crv","manual","nota_fiscal_compra","vistoria","laudo","contrato","comprovante","outros"].map((t) => (
                    <option key={t} value={t}>{toTitle(t)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Observação</label>
                <Input
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Opcional"
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Nome personalizado</label>
                <Input
                  value={nomePersonalizado}
                  onChange={(e) => setNomePersonalizado(e.target.value)}
                  placeholder="Renomeie antes de enviar"
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={() => fileInputRef.current?.click()} disabled={!canUpload || mAdd.isPending}>
                  {mAdd.isPending ? "Enviando..." : "Selecionar arquivos"}
                </Button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onPickFiles} />
              </div>
            </div>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-4 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition-all ${
                isDragActive ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              } ${!canUpload ? "opacity-60" : ""}`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">Arraste e solte arquivos aqui para enviar</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ou utilize o botão acima</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Loja provocada selecionada: <span className="font-medium text-gray-700 dark:text-gray-200">{loja?.nome ?? "nenhuma loja"}</span>
            </p>
          </PermissionGuard>

          {feedback && (
            <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
          )}

          {isLoading ? (
            <div className="text-sm text-gray-500">Carregando documentos…</div>
          ) : documentos.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum documento para este veículo.</div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {documentosOrdenados.map((doc) => (
                  <article key={doc.id} className="relative">
                    <span className="absolute left-[-1.3rem] top-2 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-purple-500 shadow" />
                    <Card>
                      <Card.Header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {doc.nome_original}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{new Date(doc.criado_em).toLocaleDateString("pt-BR")}</span>
                            <span>•</span>
                            <span>{new Date(doc.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>•</span>
                            <Badge variant="info" size="sm" className="capitalize">
                              {toTitle(doc.tipo)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => abrirPreview(doc)}>
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const url = await obterUrl(doc);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = doc.nome_original;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            Download
                          </Button>
                          {(hasPermission(Permission.DOCUMENTACAO_ANEXOS) || isAdmin()) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-500"
                              onClick={() => removerDocumento(doc)}
                              disabled={mRemove.isPending}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="grid gap-4 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-4">
                          <div>
                            <span className="block text-xs uppercase text-gray-400 dark:text-gray-500">Loja</span>
                            {doc.loja_nome ?? "—"}
                          </div>
                          <div>
                            <span className="block text-xs uppercase text-gray-400 dark:text-gray-500">Tamanho</span>
                            {formatBytes(doc.tamanho_bytes)}
                          </div>
                          <div className="md:col-span-2">
                            <span className="block text-xs uppercase text-gray-400 dark:text-gray-500">Observações</span>
                            {doc.observacao ? doc.observacao : "Sem observações"}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </article>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => {
          setPreviewDoc(null);
          setPreviewUrl(null);
        }}
        title={previewDoc?.nome_original ?? "Visualização"}
        size="xl"
      >
        <ModalContent className="space-y-4">
          {previewLoading ? (
            <div className="text-sm text-gray-500">Carregando visualização…</div>
          ) : previewDoc && previewUrl ? (
            previewTipo === "pdf" ? (
              <iframe
                src={previewUrl}
                title={`Preview ${previewDoc.nome_original}`}
                className="h-[70vh] w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            ) : previewTipo === "imagem" ? (
              <div className="relative h-[70vh] w-full">
                <Image src={previewUrl} alt="Pré-visualização" fill className="object-contain" />
              </div>
            ) : previewTipo === "texto" ? (
              <iframe
                src={previewUrl}
                title={`Preview ${previewDoc.nome_original}`}
                className="h-[70vh] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
              />
            ) : (
              <div className="text-sm text-gray-500">
                Visualização não suportada. Utilize o botão de download para abrir o arquivo.
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500">Selecione um documento para visualizar.</div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={async () => {
              if (!previewDoc) return;
              const url = await obterUrl(previewDoc);
              const link = document.createElement("a");
              link.href = url;
              link.download = previewDoc.nome_original;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download
          </Button>
          <Button variant="primary" onClick={() => {
            setPreviewDoc(null);
            setPreviewUrl(null);
          }}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
