
import { useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Factory, Loader2, MapPin, Settings2, Store, Tags } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"
import { useAuthStore } from "@/store/authStore"
import type { TableInsert, TableRow } from "@/types"

type LojaRecord = TableRow<"lojas">
type LocalRecord = TableRow<"locais">
type CaracteristicaRecord = TableRow<"caracteristicas">
type ModeloRecord = TableRow<"modelos">

async function fetchLojas(empresaId: string) {
  const { data, error } = await supabase
    .from("lojas")
    .select("id, nome")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true })

  if (error) throw error
  return (data ?? []) as LojaRecord[]
}

async function fetchLocais(empresaId: string) {
  const { data, error } = await supabase
    .from("locais")
    .select("id, nome")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true })

  if (error) throw error
  return (data ?? []) as LocalRecord[]
}

async function fetchCaracteristicas(empresaId: string) {
  const { data, error } = await supabase
    .from("caracteristicas")
    .select("id, nome")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true })

  if (error) throw error
  return (data ?? []) as CaracteristicaRecord[]
}

async function fetchModelos(empresaId: string) {
  const { data, error } = await supabase
    .from("modelos")
    .select("id, nome, marca, ano_inicial, ano_final")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true })

  if (error) throw error
  return (data ?? []) as ModeloRecord[]
}

const parseYear = (value: string) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export default function Settings() {
  const empresaId = useAuthStore((state) => state.empresaId)
  const queryClient = useQueryClient()

  const [newLojaNome, setNewLojaNome] = useState("")
  const [editingLoja, setEditingLoja] = useState<{ id: string; nome: string } | null>(null)

  const [newLocalNome, setNewLocalNome] = useState("")
  const [editingLocal, setEditingLocal] = useState<{ id: string; nome: string } | null>(null)

  const [newCaracteristica, setNewCaracteristica] = useState("")
  const [editingCaracteristica, setEditingCaracteristica] =
    useState<{ id: string; nome: string } | null>(null)

  const [modeloForm, setModeloForm] = useState({ nome: "", marca: "", anoInicial: "", anoFinal: "" })
  const [editingModelo, setEditingModelo] = useState<
    { id: string; nome: string; marca: string; anoInicial: string; anoFinal: string } | null
  >(null)

  const lojasQuery = useQuery({
    queryKey: ["lojas", empresaId],
    queryFn: () => fetchLojas(empresaId!),
    enabled: Boolean(empresaId),
  })

  const locaisQuery = useQuery({
    queryKey: ["locais", empresaId],
    queryFn: () => fetchLocais(empresaId!),
    enabled: Boolean(empresaId),
  })

  const caracteristicasQuery = useQuery({
    queryKey: ["caracteristicas", empresaId],
    queryFn: () => fetchCaracteristicas(empresaId!),
    enabled: Boolean(empresaId),
  })

  const modelosQuery = useQuery({
    queryKey: ["modelos", empresaId],
    queryFn: () => fetchModelos(empresaId!),
    enabled: Boolean(empresaId),
  })
  const createLoja = useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase.from("lojas").insert({ nome, empresa_id: empresaId })
      if (error) throw error
    },
    onSuccess: () => {
      setNewLojaNome("")
      queryClient.invalidateQueries({ queryKey: ["lojas", empresaId] })
      toast.success("Loja criada com sucesso")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel criar a loja"
      toast.error(message)
    },
  })

  const updateLoja = useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase
        .from("lojas")
        .update({ nome })
        .eq("empresa_id", empresaId)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      setEditingLoja(null)
      queryClient.invalidateQueries({ queryKey: ["lojas", empresaId] })
      toast.success("Loja atualizada")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel atualizar a loja"
      toast.error(message)
    },
  })

  const deleteLoja = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase.from("lojas").delete().eq("empresa_id", empresaId).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lojas", empresaId] })
      toast.success("Loja removida")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel remover a loja"
      toast.error(message)
    },
  })
  const createLocal = useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase.from("locais").insert({ nome, empresa_id: empresaId })
      if (error) throw error
    },
    onSuccess: () => {
      setNewLocalNome("")
      queryClient.invalidateQueries({ queryKey: ["locais", empresaId] })
      toast.success("Local criado")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel criar o local"
      toast.error(message)
    },
  })

  const updateLocal = useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase
        .from("locais")
        .update({ nome })
        .eq("empresa_id", empresaId)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      setEditingLocal(null)
      queryClient.invalidateQueries({ queryKey: ["locais", empresaId] })
      toast.success("Local atualizado")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o local"
      toast.error(message)
    },
  })

  const deleteLocal = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase.from("locais").delete().eq("empresa_id", empresaId).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locais", empresaId] })
      toast.success("Local removido")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel remover o local"
      toast.error(message)
    },
  })
  const createCaracteristica = useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase
        .from("caracteristicas")
        .insert({ nome, empresa_id: empresaId })
      if (error) throw error
    },
    onSuccess: () => {
      setNewCaracteristica("")
      queryClient.invalidateQueries({ queryKey: ["caracteristicas", empresaId] })
      toast.success("Caracteristica criada")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel criar a caracteristica"
      toast.error(message)
    },
  })

  const updateCaracteristica = useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase
        .from("caracteristicas")
        .update({ nome })
        .eq("empresa_id", empresaId)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      setEditingCaracteristica(null)
      queryClient.invalidateQueries({ queryKey: ["caracteristicas", empresaId] })
      toast.success("Caracteristica atualizada")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel atualizar a caracteristica"
      toast.error(message)
    },
  })

  const deleteCaracteristica = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase
        .from("caracteristicas")
        .delete()
        .eq("empresa_id", empresaId)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caracteristicas", empresaId] })
      toast.success("Caracteristica removida")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel remover a caracteristica"
      toast.error(message)
    },
  })
  const createModelo = useMutation({
    mutationFn: async ({
      nome,
      marca,
      anoInicial,
      anoFinal,
    }: {
      nome: string
      marca: string
      anoInicial: string
      anoFinal: string
    }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const payload: TableInsert<"modelos"> = {
        nome,
        marca,
        empresa_id: empresaId,
        ano_inicial: parseYear(anoInicial),
        ano_final: parseYear(anoFinal),
      }
      const { error } = await supabase.from("modelos").insert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      setModeloForm({ nome: "", marca: "", anoInicial: "", anoFinal: "" })
      queryClient.invalidateQueries({ queryKey: ["modelos", empresaId] })
      toast.success("Modelo criado")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel criar o modelo"
      toast.error(message)
    },
  })

  const updateModelo = useMutation({
    mutationFn: async ({
      id,
      nome,
      marca,
      anoInicial,
      anoFinal,
    }: {
      id: string
      nome: string
      marca: string
      anoInicial: string
      anoFinal: string
    }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase
        .from("modelos")
        .update({
          nome,
          marca,
          ano_inicial: parseYear(anoInicial),
          ano_final: parseYear(anoFinal),
        })
        .eq("empresa_id", empresaId)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      setEditingModelo(null)
      queryClient.invalidateQueries({ queryKey: ["modelos", empresaId] })
      toast.success("Modelo atualizado")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o modelo"
      toast.error(message)
    },
  })

  const deleteModelo = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!empresaId) throw new Error("Empresa nao encontrada")
      const { error } = await supabase.from("modelos").delete().eq("empresa_id", empresaId).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelos", empresaId] })
      toast.success("Modelo removido")
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Nao foi possivel remover o modelo"
      toast.error(message)
    },
  })
  if (!empresaId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-8 text-center">
        <Settings2 className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold text-muted-foreground">
          Conecte-se a uma empresa para acessar as configuracoes.
        </p>
      </div>
    )
  }

  const handleCreateLoja = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nome = newLojaNome.trim()
    if (!nome) return
    await createLoja.mutateAsync({ nome })
  }

  const handleSaveLoja = async () => {
    if (!editingLoja) return
    const nome = editingLoja.nome.trim()
    if (!nome) return
    await updateLoja.mutateAsync({ id: editingLoja.id, nome })
  }

  const handleDeleteLoja = async (id: string) => {
    const confirmed = window.confirm("Deseja remover esta loja?")
    if (!confirmed) return
    await deleteLoja.mutateAsync({ id })
  }

  const handleCreateLocal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nome = newLocalNome.trim()
    if (!nome) return
    await createLocal.mutateAsync({ nome })
  }

  const handleSaveLocal = async () => {
    if (!editingLocal) return
    const nome = editingLocal.nome.trim()
    if (!nome) return
    await updateLocal.mutateAsync({ id: editingLocal.id, nome })
  }

  const handleDeleteLocal = async (id: string) => {
    const confirmed = window.confirm("Deseja remover este local?")
    if (!confirmed) return
    await deleteLocal.mutateAsync({ id })
  }

  const handleCreateCaracteristica = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nome = newCaracteristica.trim()
    if (!nome) return
    await createCaracteristica.mutateAsync({ nome })
  }

  const handleSaveCaracteristica = async () => {
    if (!editingCaracteristica) return
    const nome = editingCaracteristica.nome.trim()
    if (!nome) return
    await updateCaracteristica.mutateAsync({ id: editingCaracteristica.id, nome })
  }

  const handleDeleteCaracteristica = async (id: string) => {
    const confirmed = window.confirm("Deseja remover esta caracteristica?")
    if (!confirmed) return
    await deleteCaracteristica.mutateAsync({ id })
  }

  const handleCreateModelo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nome = modeloForm.nome.trim()
    const marca = modeloForm.marca.trim()
    if (!nome || !marca) return
    await createModelo.mutateAsync({
      nome,
      marca,
      anoInicial: modeloForm.anoInicial.trim(),
      anoFinal: modeloForm.anoFinal.trim(),
    })
  }

  const handleSaveModelo = async () => {
    if (!editingModelo) return
    const nome = editingModelo.nome.trim()
    const marca = editingModelo.marca.trim()
    if (!nome || !marca) return
    await updateModelo.mutateAsync({
      id: editingModelo.id,
      nome,
      marca,
      anoInicial: editingModelo.anoInicial.trim(),
      anoFinal: editingModelo.anoFinal.trim(),
    })
  }

  const handleDeleteModelo = async (id: string) => {
    const confirmed = window.confirm("Deseja remover este modelo?")
    if (!confirmed) return
    await deleteModelo.mutateAsync({ id })
  }
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuracoes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie estruturas operacionais da empresa para padronizar o cadastro de veiculos.
          </p>
        </div>
      </header>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" /> Lojas
          </CardTitle>
          <CardDescription>Defina as unidades que podem receber estoque.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCreateLoja}>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="novaLoja">
                Nome da loja
              </label>
              <input
                id="novaLoja"
                value={newLojaNome}
                onChange={(event) => setNewLojaNome(event.target.value)}
                placeholder="Unidade matriz"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <Button type="submit" disabled={createLoja.isPending || !newLojaNome.trim()} className="sm:w-auto">
              {createLoja.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                </span>
              ) : (
                "Adicionar"
              )}
            </Button>
          </form>
          {lojasQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : lojasQuery.data && lojasQuery.data.length > 0 ? (
            <div className="space-y-3">
              {lojasQuery.data.map((loja) => (
                <div
                  key={loja.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editingLoja?.id === loja.id ? (
                    <input
                      value={editingLoja.nome}
                      onChange={(event) =>
                        setEditingLoja((prev) => (prev ? { ...prev, nome: event.target.value } : null))
                      }
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-64"
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{loja.nome}</p>
                      <p className="text-xs text-muted-foreground">ID: {loja.id}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingLoja?.id === loja.id ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLoja(null)}
                          disabled={updateLoja.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveLoja}
                          disabled={updateLoja.isPending || !editingLoja.nome.trim()}
                        >
                          {updateLoja.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLoja({ id: loja.id, nome: loja.nome })}
                          disabled={deleteLoja.isPending}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLoja(loja.id)}
                          disabled={deleteLoja.isPending}
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma loja cadastrada ate o momento.</p>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-info" /> Locais operacionais
          </CardTitle>
          <CardDescription>Mapeie patios, oficinas e demais areas internas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCreateLocal}>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="novoLocal">
                Nome do local
              </label>
              <input
                id="novoLocal"
                value={newLocalNome}
                onChange={(event) => setNewLocalNome(event.target.value)}
                placeholder="Patio principal"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <Button type="submit" disabled={createLocal.isPending || !newLocalNome.trim()} className="sm:w-auto">
              {createLocal.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                </span>
              ) : (
                "Adicionar"
              )}
            </Button>
          </form>
          {locaisQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : locaisQuery.data && locaisQuery.data.length > 0 ? (
            <div className="space-y-3">
              {locaisQuery.data.map((local) => (
                <div
                  key={local.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editingLocal?.id === local.id ? (
                    <input
                      value={editingLocal.nome}
                      onChange={(event) =>
                        setEditingLocal((prev) => (prev ? { ...prev, nome: event.target.value } : null))
                      }
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-64"
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{local.nome}</p>
                      <p className="text-xs text-muted-foreground">ID: {local.id}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingLocal?.id === local.id ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLocal(null)}
                          disabled={updateLocal.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveLocal}
                          disabled={updateLocal.isPending || !editingLocal.nome.trim()}
                        >
                          {updateLocal.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLocal({ id: local.id, nome: local.nome })}
                          disabled={deleteLocal.isPending}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLocal(local.id)}
                          disabled={deleteLocal.isPending}
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum local cadastrado.</p>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-warning" /> Caracteristicas
          </CardTitle>
          <CardDescription>Padronize etiquetas e atributos aplicados aos veiculos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCreateCaracteristica}>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="novaCaracteristica">
                Nome da caracteristica
              </label>
              <input
                id="novaCaracteristica"
                value={newCaracteristica}
                onChange={(event) => setNewCaracteristica(event.target.value)}
                placeholder="Blindado, garantia estendida ..."
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={createCaracteristica.isPending || !newCaracteristica.trim()}
              className="sm:w-auto"
            >
              {createCaracteristica.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                </span>
              ) : (
                "Adicionar"
              )}
            </Button>
          </form>
          {caracteristicasQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : caracteristicasQuery.data && caracteristicasQuery.data.length > 0 ? (
            <div className="space-y-3">
              {caracteristicasQuery.data.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editingCaracteristica?.id === item.id ? (
                    <input
                      value={editingCaracteristica.nome}
                      onChange={(event) =>
                        setEditingCaracteristica((prev) =>
                          prev ? { ...prev, nome: event.target.value } : null
                        )
                      }
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-64"
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingCaracteristica?.id === item.id ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCaracteristica(null)}
                          disabled={updateCaracteristica.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveCaracteristica}
                          disabled=
                            {updateCaracteristica.isPending || !editingCaracteristica.nome.trim()}
                        >
                          {updateCaracteristica.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCaracteristica({ id: item.id, nome: item.nome })}
                          disabled={deleteCaracteristica.isPending}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCaracteristica(item.id)}
                          disabled={deleteCaracteristica.isPending}
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma caracteristica cadastrada.</p>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-success" /> Modelos de veiculo
          </CardTitle>
          <CardDescription>Cadastre modelos padrao para agilizar novos veiculos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleCreateModelo}>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="modeloNome">
                Nome do modelo
              </label>
              <input
                id="modeloNome"
                value={modeloForm.nome}
                onChange={(event) => setModeloForm((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Corolla Altis"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="modeloMarca">
                Marca
              </label>
              <input
                id="modeloMarca"
                value={modeloForm.marca}
                onChange={(event) => setModeloForm((prev) => ({ ...prev, marca: event.target.value }))}
                placeholder="Toyota"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="modeloAnoInicial">
                  Ano inicial
                </label>
                <input
                  id="modeloAnoInicial"
                  value={modeloForm.anoInicial}
                  onChange={(event) => setModeloForm((prev) => ({ ...prev, anoInicial: event.target.value }))}
                  type="number"
                  min={1900}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="modeloAnoFinal">
                  Ano final
                </label>
                <input
                  id="modeloAnoFinal"
                  value={modeloForm.anoFinal}
                  onChange={(event) => setModeloForm((prev) => ({ ...prev, anoFinal: event.target.value }))}
                  type="number"
                  min={1900}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button
                type="submit"
                disabled={
                  createModelo.isPending || !modeloForm.nome.trim() || !modeloForm.marca.trim()
                }
              >
                {createModelo.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                  </span>
                ) : (
                  "Adicionar modelo"
                )}
              </Button>
            </div>
          </form>
          {modelosQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : modelosQuery.data && modelosQuery.data.length > 0 ? (
            <div className="space-y-3">
              {modelosQuery.data.map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  {editingModelo?.id === modelo.id ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
                      <input
                        value={editingModelo.nome}
                        onChange={(event) =>
                          setEditingModelo((prev) => (prev ? { ...prev, nome: event.target.value } : null))
                        }
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      />
                      <input
                        value={editingModelo.marca}
                        onChange={(event) =>
                          setEditingModelo((prev) => (prev ? { ...prev, marca: event.target.value } : null))
                        }
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      />
                      <input
                        value={editingModelo.anoInicial}
                        onChange={(event) =>
                          setEditingModelo((prev) =>
                            prev ? { ...prev, anoInicial: event.target.value } : null
                          )
                        }
                        type="number"
                        placeholder="Inicial"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      />
                      <input
                        value={editingModelo.anoFinal}
                        onChange={(event) =>
                          setEditingModelo((prev) =>
                            prev ? { ...prev, anoFinal: event.target.value } : null
                          )
                        }
                        type="number"
                        placeholder="Final"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {modelo.marca} {modelo.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Intervalo de anos: {modelo.ano_inicial ?? "-"} - {modelo.ano_final ?? "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">ID: {modelo.id}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingModelo?.id === modelo.id ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingModelo(null)}
                          disabled={updateModelo.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveModelo}
                          disabled={
                            updateModelo.isPending ||
                            !editingModelo.nome.trim() ||
                            !editingModelo.marca.trim()
                          }
                        >
                          {updateModelo.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingModelo({
                              id: modelo.id,
                              nome: modelo.nome,
                              marca: modelo.marca,
                              anoInicial: modelo.ano_inicial?.toString() ?? "",
                              anoFinal: modelo.ano_final?.toString() ?? "",
                            })
                          }
                          disabled={deleteModelo.isPending}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteModelo(modelo.id)}
                          disabled={deleteModelo.isPending}
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum modelo cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
