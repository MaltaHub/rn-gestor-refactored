import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-slate-500 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">Gestor Automotivo</p>
            <p className="text-xs text-slate-500">
              Interface declarativa para acelerar a operação do seu negócio automotivo.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.2em]">
            <a href="#modulos" className="transition-colors hover:text-sky-100">
              Módulos
            </a>
            <a href="#operacao" className="transition-colors hover:text-sky-100">
              Operação
            </a>
            <Link href="/app" className="transition-colors hover:text-sky-100">
              Cockpit
            </Link>
          </div>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Gestor Automotivo. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
