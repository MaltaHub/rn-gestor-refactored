import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Calendar, Gauge, PenSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useVehicles } from "@/hooks/useVehicles"
import type { VehicleRecord } from "@/services/veiculos"
import { useLocais, useModelos } from "@/hooks/useCompanyConfigurations"

export function VehicleDetails() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const { data: vehicles, isLoading, isError, error } = useVehicles()
  const locaisQuery = useLocais()
  const modelosQuery = useModelos()

  const vehicle: VehicleRecord | undefined = useMemo(
    () => vehicles?.find((item) => item.id === vehicleId),
    [vehicles, vehicleId]
  )

  const localNome = vehicle
    ? locaisQuery.data?.find((local) => local.id === vehicle.local_id)?.nome ?? "Não informado"
    : null

  const modeloInfo = vehicle
    ? modelosQuery.data?.find((modelo) => modelo.id === vehicle.modelo_id)
    : null

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold">Ficha do veículo</h1>
          <p className="text-sm text-muted-foreground">
            Detalhes consolidados do veículo selecionado a partir do fluxo de estoque geral.
          </p>
        </div>
        {vehicle && (
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/estoque">Ver estoque</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to={`/app/veiculos/${vehicle.id}/editar`} className="gap-2">
                <PenSquare className="h-4 w-4" /> Editar veículo
              </Link>
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 animate-spin" /> Carregando informações do veículo...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive/60 bg-destructive/10 shadow-card">
          <CardHeader>
            <CardTitle className="text-destructive">Falha ao carregar dados</CardTitle>
            <CardDescription className="text-destructive">
              {error instanceof Error ? error.message : "Erro inesperado ao consultar o veículo."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !vehicle && (
        <Card className="shadow-card">
          <CardContent className="space-y-4 py-12 text-center text-sm text-muted-foreground">
            <Gauge className="mx-auto h-8 w-8" />
            <p className="text-lg font-semibold text-foreground">Veículo não encontrado</p>
            <p>
              Verifique se o veículo ainda está associado à empresa atual ou se foi removido recentemente do estoque.
            </p>
            <Button variant="outline" onClick={() => navigate("/app/estoque")}>Voltar para o estoque</Button>
          </CardContent>
        </Card>
      )}

      {vehicle && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold uppercase tracking-wide text-foreground">
                {vehicle.placa}
              </CardTitle>
              <CardDescription>
                {(modeloInfo?.marca ?? "Modelo") + " " + (modeloInfo?.nome ?? "não informado")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail label="Estado de venda" value={vehicle.estado_venda} />
              <Detail label="Estado do veículo" value={vehicle.estado_veiculo ?? "não informado"} />
              <Detail
                label="Hodômetro"
                value={`${vehicle.hodometro.toLocaleString("pt-BR")} km`}
              />
              <Detail
                label="Preço de venda"
                value={
                  vehicle.preco_venal
                    ? vehicle.preco_venal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "não informado"
                }
              />
              <Detail label="Local" value={localNome ?? "não informado"} />
              <Detail label="Observação" value={vehicle.observacao ?? "Sem observações"} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Linha do tempo</CardTitle>
              <CardDescription>Momentos principais registrados automaticamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <TimelineEntry
                label="Registrado em"
                value={new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(
                  new Date(vehicle.registrado_em)
                )}
              />
              <TimelineEntry
                label="Última atualização"
                value={new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(
                  new Date(vehicle.editado_em)
                )}
              />
              <TimelineEntry label="Responsável pelo cadastro" value={vehicle.registrado_por} />
              <TimelineEntry label="Última edição" value={vehicle.editado_por} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

function TimelineEntry({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value ?? "Não informado"}</p>
      </div>
    </div>
  )
}

export default VehicleDetails
