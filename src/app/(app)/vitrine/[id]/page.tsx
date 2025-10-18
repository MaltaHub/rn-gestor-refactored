"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useVeiculoLojaUI, type VeiculoLojaUI } from "@/adapters/adaptador-vitrine";
import { useFotosVeiculoLoja } from "@/hooks/use-fotos-veiculo-loja";
import { useLocais, useLojas } from "@/hooks/use-configuracoes";
import { useLojaStore } from "@/stores/useLojaStore";
import { RemoveVehicleFromStoreButton } from "../loja-actions";
import { VehicleGallery } from "@/components/vitrine/VehicleGallery";
import { PhotoLightbox } from "@/components/vitrine/PhotoLightbox";
import { VehicleInfo } from "@/components/vitrine/VehicleInfo";
import { PriceInfo } from "@/components/vitrine/PriceInfo";
import { CharacteristicsInfo } from "@/components/vitrine/CharacteristicsInfo";
import { QuickActions } from "@/components/vitrine/QuickActions";
import { ShareImagesButton } from "@/components/vitrine/ShareImagesButton";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@/types/rbac";
import { isEstadoVendido } from "@/utils/status";

type EstadoVenda = NonNullable<VeiculoLojaUI["veiculo"]>["estado_venda"];

export default function VitrineDetalhePage() {
  const params = useParams<{ id: string }>();
  const veiculoLojaId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: veiculoLoja, isLoading } = useVeiculoLojaUI(veiculoLojaId);
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();

  const setLojaSelecionada = useLojaStore((state) => state.setLojaSelecionada);
  const lojaAtualId = useLojaStore((state) => state.lojaSelecionada?.id ?? null);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const veiculo = veiculoLoja?.veiculo ?? null;
  const estadoVendaDisplay = veiculo?.estadoVendaLabel ?? "Sem status";
  const estadoVendaVariant = isEstadoVendido(estadoVendaDisplay) ? "danger" : "info";

  const lojaNomePorId = useMemo(() => {
    const mapa = new Map<string, string>();
    lojas.forEach((loja) => {
      if (loja.id) {
        mapa.set(loja.id, loja.nome);
      }
    });
    return mapa;
  }, [lojas]);

  const localOptions = useMemo(() => {
    return locais
      .map((local) => {
        const pertenceALoja = local.loja_id ? local.loja_id === veiculoLoja?.lojaId : false;
        const lojaNome = local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${local.nome}` : local.nome;
        const prioridade = pertenceALoja ? 0 : local.loja_id ? 1 : 2;
        return {
          value: local.id,
          label,
          pertenceALoja,
          prioridade,
        } as const;
      })
      .sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
        return a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" });
      });
  }, [locais, lojaNomePorId, veiculoLoja?.lojaId]);

  useEffect(() => {
    if (veiculoLoja?.loja && veiculoLoja.loja.id !== lojaAtualId) {
      setLojaSelecionada(veiculoLoja.loja);
    }
  }, [veiculoLoja?.loja, setLojaSelecionada, lojaAtualId]);

  const {
    data: fotos = [],
    isLoading: isFotosLoading,
  } = useFotosVeiculoLoja({
    empresaId: veiculoLoja?.empresaId,
    lojaId: veiculoLoja?.lojaId,
    veiculoId: veiculoLoja?.veiculoId,
  });

  const handleOpenLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const goToPrevFoto = useCallback(() => {
    if (!fotos.length) return;
    setLightboxIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
  }, [fotos.length]);

  const goToNextFoto = useCallback(() => {
    if (!fotos.length) return;
    setLightboxIndex((prev) => (prev + 1) % fotos.length);
  }, [fotos.length]);

  if (!veiculoLojaId) {
    return (
      <div className="px-6 py-10 text-gray-600 dark:text-gray-400">
        <p>Identificador inválido.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 py-10 text-gray-600 dark:text-gray-400">
        <p>Carregando informações da vitrine...</p>
      </div>
    );
  }

  if (!veiculoLoja || !veiculo) {
    return (
      <div className="px-6 py-10 text-gray-600 dark:text-gray-400">
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
          <p className="text-sm">Veículo não encontrado para esta vitrine.</p>
          <Link
            href="/vitrine"
            className="mt-4 inline-flex items-center rounded-md bg-purple-600 dark:bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 dark:hover:bg-purple-600"
          >
            Voltar para vitrine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PhotoLightbox
        fotos={fotos}
        fotoAtiva={lightboxIndex}
        vehicleDisplay={veiculo?.veiculoDisplay ?? "Veículo"}
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
        onPrevious={goToPrevFoto}
        onNext={goToNextFoto}
      />

      <div className="bg-white dark:bg-gray-950 px-6 py-10 text-gray-900 dark:text-gray-100 min-h-screen">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-3">
            <Link
              href="/vitrine"
              className="text-sm font-medium text-purple-600 dark:text-purple-400 transition hover:text-purple-700 dark:hover:text-purple-300"
            >
              ← Voltar para a vitrine
            </Link>
          </header>

          <VehicleGallery
            fotos={fotos}
            isLoading={isFotosLoading}
            vehicleDisplay={veiculo?.veiculoDisplay ?? "Veículo"}
            onOpenLightbox={handleOpenLightbox}
          />

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {veiculo.veiculoDisplay}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Loja: {veiculoLoja.lojaNome ?? "não informada"}</span>
                  <span>•</span>
                  <span className="font-mono">Placa: {veiculo.placa}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ShareImagesButton
                  fotos={fotos}
                  vehicleDisplay={veiculo.veiculoDisplay}
                />
                <Badge variant={estadoVendaVariant} className="font-semibold text-sm px-3 py-1">
                  {estadoVendaDisplay}
                </Badge>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6">
              <VehicleInfo veiculo={veiculo} dataEntrada={veiculoLoja.dataEntradaFormatada ?? undefined} />
              <PriceInfo
                precoLoja={veiculoLoja.precoLojaFormatado}
                precoVeiculo={veiculo.precoFormatado}
              />
              <CharacteristicsInfo veiculo={veiculo} />
            </div>
          </section>

          <QuickActions
            veiculoLojaId={veiculoLoja.id}
            veiculoId={veiculoLoja.veiculoId}
            lojaId={veiculoLoja.lojaId}
            localAtualId={veiculo.local?.id}
            statusAtual={veiculo.estado_venda as EstadoVenda}
            precoLojaAtual={veiculoLoja.precoLoja}
            precoLojaFormatado={veiculoLoja.precoLojaFormatado}
            precoEstoque={veiculo?.preco_venal ?? null}
            locais={localOptions}
            lojaNome={veiculoLoja.loja?.nome}
          />

          <PermissionGuard permission={Permission.VITRINE_REMOVER}>
            <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Remover veículo desta vitrine
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    Ao remover, o veículo continuará disponível no estoque geral.
                  </p>
                </div>
                <RemoveVehicleFromStoreButton
                  veiculoLojaId={veiculoLoja.id}
                  redirectTo="/vitrine"
                  onRemoved={() => {}}
                />
              </div>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </>
  );
}
