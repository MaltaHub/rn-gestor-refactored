import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-20">
      <Card className="w-full max-w-xl border-white/10 bg-slate-900/70 p-10 text-center">
        <CardHeader className="items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200">
            <Compass className="h-5 w-5" />
          </span>
          <CardTitle className="text-2xl">Página não encontrada</CardTitle>
          <CardDescription>
            O caminho informado ainda não foi mapeado. Use os menus ou retorne à visão principal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/app">
            <Button className="w-full">Ir para o cockpit</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">Voltar à landing</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
