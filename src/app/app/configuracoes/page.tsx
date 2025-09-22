"use client";

import { FormEvent, useState } from "react";
import { Save, Wrench } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [name, setName] = useState("Garagem Horizonte");
  const [brandColor, setBrandColor] = useState("#38bdf8");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // action: persistir preferências no backend/feature flag service
    console.info("Salvar configurações", { name, brandColor, timezone });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações da operação"
        description="Mapeie identificação visual, horários e preferências antes de conectar persistência real."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-2">
            <CardTitle>Identidade da empresa</CardTitle>
            <CardDescription>Campos iniciais para conectar com cadastro corporativo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="company" className="text-sm font-semibold text-slate-200">
                Nome fantasia
              </label>
              <Input
                id="company"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome fantasia"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="color" className="text-sm font-semibold text-slate-200">
                Cor principal
              </label>
              <Input
                id="color"
                type="color"
                value={brandColor}
                onChange={(event) => setBrandColor(event.target.value)}
                className="h-12 cursor-pointer border border-white/10 bg-slate-950/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="timezone" className="text-sm font-semibold text-slate-200">
                Fuso horário
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Fortaleza">America/Fortaleza</option>
                <option value="America/Manaus">America/Manaus</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/80">
          <CardHeader className="gap-2">
            <CardTitle>Preferências operacionais</CardTitle>
            <CardDescription>Planeje recursos adicionais para orquestrar integrações.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-transparent" />
              Receber alertas por email
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-transparent" />
              Exibir métricas avançadas
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
              Ativar modo auditoria
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
              Exigir aprovação dupla em propostas
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" className="gap-2 text-sm" onClick={() => {
            // action: restaurar dados originais via serviço de preferências
            console.info("Reverter alterações");
          }}>
            Desfazer alterações
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Salvar configurações
          </Button>
        </div>
      </form>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="flex items-start gap-3">
          <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
            <Wrench className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>Próximos passos técnicos</CardTitle>
            <CardDescription>
              Utilize este bloco para orientar integrações: autenticação, storage, funções serverless e automações.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
