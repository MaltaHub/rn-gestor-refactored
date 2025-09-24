"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { vitrineService } from "@/lib/services/domains";
import type { VitrineDetalhe } from "@/types/domain";

export default function DetalheVitrinePage() {
  const router = useRouter();
  const params = useParams<{ vehicleId: string }>();
  const globalLojaId = useGlobalLojaId();
  const veiculoId = Array.isArray(params?.vehicleId) ? params?.vehicleId[0] : params?.vehicleId;

  const [detalhe, setDetalhe] = useState<VitrineDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const carregarDetalhe = useCallback(async (veiculo: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const dados = await vitrineService.obterDetalhes(veiculo, globalLojaId ?? undefined);
      if (!dados) {
        setFeedback("Veículo não encontrado na vitrine da loja atual.");
        return;
      }
      setDetalhe(dados);
    } catch (error) {
      console.error("Falha ao carregar detalhes da vitrine", error);
      setFeedback("Não foi possível carregar o veículo na vitrine.");
    } finally {
      setIsLoading(false);
    }
  }, [globalLojaId]);

  useEffect(() => {
    if (!veiculoId) return;
    void carregarDetalhe(veiculoId);
  }, [veiculoId, carregarDetalhe]);

  if (!veiculoId) {
    return <p className="text-sm text-slate-400">Identificador do veículo não informado.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={detalhe ? detalhe.titulo : "Detalhe da vitrine"}
        description="Visualização completa do veículo na vitrine, conectada ao serviço `vitrine.detalhes`."
        actions={
          <Button variant="ghost" className="gap-2" onClick={() => router.push("/app/vitrine")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para a vitrine
          </Button>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      {isLoading ? (
        <p className="text-sm text-slate-400">Carregando detalhes da vitrine...</p>
      ) : detalhe ? (
        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-900/70">
            <CardHeader className="gap-3">
              <CardTitle>Informações principais</CardTitle>
              <CardDescription>Resumo fornecido pelo serviço de vitrine para a loja atual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Preço:</span> {detalhe.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              <p><span className="text-slate-500">Status do anúncio:</span> {detalhe.statusAnuncio}</p>
              <p><span className="text-slate-500">Descrição:</span> {detalhe.descricao ?? "-"}</p>
              <p><span className="text-slate-500">Última atualização:</span> {new Date(detalhe.ultimaAtualizacao).toLocaleString("pt-BR")}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/70">
            <CardHeader className="gap-3">
              <CardTitle>Galeria</CardTitle>
              <CardDescription>Mídia exibida na vitrine para a loja atual.</CardDescription>
            </CardHeader>
            <CardContent>
              {detalhe.fotos.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma foto cadastrada para este veículo.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {detalhe.fotos.map((foto, index) => (
                    <div key={`${foto}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                      <Image
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        width={320}
                        height={200}
                        className="h-40 w-full object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
