"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Info, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService, empresasService } from "@/lib/services/domains";

interface ConviteMensagem {
  tipo: "sucesso" | "erro" | "info";
  mensagem: string;
}

export default function LobbyPage() {
  const [empresaStatus, setEmpresaStatus] = useState<ConviteMensagem | null>(null);
  const [conviteToken, setConviteToken] = useState("");
  const [conviteValidacao, setConviteValidacao] = useState<ConviteMensagem | null>(null);
  const [conviteMensagem, setConviteMensagem] = useState<ConviteMensagem | null>(null);
  const [isCriandoEmpresa, setIsCriandoEmpresa] = useState(false);
  const [isValidandoConvite, setIsValidandoConvite] = useState(false);
  const [isAceitandoConvite, setIsAceitandoConvite] = useState(false);

  const handleCriarEmpresa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    const documento = String(formData.get("documento") ?? "").trim();
    const emailContato = String(formData.get("email") ?? "").trim();

    if (!nome) {
      setEmpresaStatus({ tipo: "erro", mensagem: "Informe o nome da empresa." });
      return;
    }

    setIsCriandoEmpresa(true);
    try {
      const resultado = await empresasService.criarEmpresa({
        nome,
        documento: documento || undefined,
        emailContato: emailContato || undefined
      });
      setEmpresaStatus({
        tipo: "sucesso",
        mensagem: `Empresa ${resultado.empresaNome} criada com sucesso. Loja padrão: ${resultado.lojaPadraoId ?? "defina após o onboarding"}.`
      });
    } catch (error) {
      console.error("Falha ao criar empresa", error);
      setEmpresaStatus({ tipo: "erro", mensagem: "Não foi possível criar a empresa. Tente novamente." });
    } finally {
      setIsCriandoEmpresa(false);
    }
  };

  const handleValidarConvite = async () => {
    if (!conviteToken.trim()) {
      setConviteValidacao({ tipo: "erro", mensagem: "Informe o token recebido por e-mail." });
      return;
    }
    setIsValidandoConvite(true);
    try {
      const resultado = await authService.validarConvite(conviteToken.trim());
      if (resultado.valido) {
        setConviteValidacao({
          tipo: "sucesso",
          mensagem: `Convite válido para ${resultado.empresa?.nome ?? "empresa"}. Expira em ${
            resultado.expiraEm ? new Date(resultado.expiraEm).toLocaleDateString("pt-BR") : "breve"
          }.`
        });
      } else {
        setConviteValidacao({ tipo: "erro", mensagem: resultado.mensagem ?? "Convite inválido ou expirado." });
      }
    } catch (error) {
      console.error("Falha ao validar convite", error);
      setConviteValidacao({ tipo: "erro", mensagem: "Não foi possível validar o token." });
    } finally {
      setIsValidandoConvite(false);
    }
  };

  const handleAceitarConvite = async () => {
    if (!conviteToken.trim()) {
      setConviteMensagem({ tipo: "erro", mensagem: "Informe o token para aceitar o convite." });
      return;
    }
    setIsAceitandoConvite(true);
    try {
      const resultado = await authService.aceitarConvite(conviteToken.trim());
      if (resultado.sucesso) {
        setConviteMensagem({ tipo: "sucesso", mensagem: "Convite aceito! Você já pode acessar o cockpit com sua empresa." });
      } else {
        setConviteMensagem({ tipo: "erro", mensagem: "Não foi possível aceitar o convite." });
      }
    } catch (error) {
      console.error("Erro ao aceitar convite", error);
      setConviteMensagem({ tipo: "erro", mensagem: "Falha ao aceitar o convite." });
    } finally {
      setIsAceitandoConvite(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-10">
      <div className="space-y-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar ao login
        </Link>
        <h1 className="text-3xl font-semibold text-white">Construa sua operação</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400">
          Crie uma nova concessionária ou utilize o token recebido para ingressar em uma operação existente. As ações abaixo já estão conectadas aos serviços de criação e convites.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-200">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <CardTitle>Iniciar uma nova empresa</CardTitle>
              <CardDescription>Preencha os dados principais para gerar o ambiente inicial.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCriarEmpresa}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200" htmlFor="nome">
                  Nome da empresa
                </label>
                <Input id="nome" name="nome" placeholder="Grupo Horizonte Motors" required disabled={isCriandoEmpresa} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200" htmlFor="documento">
                  Documento (opcional)
                </label>
                <Input id="documento" name="documento" placeholder="CNPJ ou CPF" disabled={isCriandoEmpresa} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200" htmlFor="email">
                  E-mail de contato (opcional)
                </label>
                <Input id="email" name="email" type="email" placeholder="contato@empresa.com" disabled={isCriandoEmpresa} />
              </div>
              <Button type="submit" className="w-full" disabled={isCriandoEmpresa}>
                {isCriandoEmpresa ? "Criando..." : "Criar empresa"}
              </Button>
            </form>
            {empresaStatus ? (
              <p
                className={`mt-4 text-xs ${
                  empresaStatus.tipo === "sucesso"
                    ? "text-emerald-300"
                    : empresaStatus.tipo === "erro"
                    ? "text-rose-300"
                    : "text-slate-400"
                }`}
              >
                {empresaStatus.mensagem}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-200">
              <Ticket className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <CardTitle>Já tenho convite</CardTitle>
              <CardDescription>Valide o token recebido e entre na estrutura da empresa.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="token">
                Token do convite
              </label>
              <Input
                id="token"
                value={conviteToken}
                onChange={(event) => {
                  setConviteToken(event.target.value);
                  setConviteValidacao(null);
                  setConviteMensagem(null);
                }}
                placeholder="TOKEN-123"
                disabled={isValidandoConvite || isAceitandoConvite}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={handleValidarConvite} disabled={isValidandoConvite || !conviteToken.trim()}>
                {isValidandoConvite ? "Validando..." : "Validar token"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAceitarConvite}
                disabled={isAceitandoConvite || !conviteToken.trim()}
              >
                {isAceitandoConvite ? "Confirmando..." : "Aceitar convite"}
              </Button>
            </div>
            {conviteValidacao ? (
              <p
                className={`text-xs ${
                  conviteValidacao.tipo === "sucesso"
                    ? "text-emerald-300"
                    : conviteValidacao.tipo === "erro"
                    ? "text-rose-300"
                    : "text-slate-400"
                }`}
              >
                {conviteValidacao.mensagem}
              </p>
            ) : null}
            {conviteMensagem ? (
              <p
                className={`text-xs ${
                  conviteMensagem.tipo === "sucesso"
                    ? "text-emerald-300"
                    : conviteMensagem.tipo === "erro"
                    ? "text-rose-300"
                    : "text-slate-400"
                }`}
              >
                {conviteMensagem.mensagem}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="flex flex-row items-start gap-3">
          <span className="rounded-2xl bg-sky-500/20 p-2 text-sky-200">
            <Info className="h-4 w-4" />
          </span>
          <div className="space-y-2">
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>
              Tokens de convite expiram automaticamente e podem ser revogados pelo administrador. Dúvidas podem ser enviadas para o suporte ou consultadas na documentação.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="font-semibold text-slate-100">Sem convite?</p>
            <p className="text-xs text-slate-400">
              Crie a empresa e convide outros usuários depois. Cada ação já utiliza os serviços de criação e envio de convites.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="font-semibold text-slate-100">Precisa de ajuda?</p>
            <p className="text-xs text-slate-400">
              Entre em contato com a equipe de suporte ou consulte a central de ajuda para entender permissões e próximos passos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
