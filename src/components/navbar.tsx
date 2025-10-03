"use client";

import Link from "next/link";
import { useState } from "react";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: empresa, isLoading } = useEmpresaDoUsuario();
  console.log(empresa?.papel ?? "nenhum");

  const linksProprietario = [
    { href: "/admin", label: "Admin" },
    { href: "/estoque", label: "Estoque" },
    { href: "/configuracoes", label: "Configurações" },
  ];

  return (
    <header className="w-full border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-blue-600">
          Gestor
        </Link>

        {/* Menu desktop */}
        <nav className="hidden gap-6 text-sm font-medium text-zinc-600 sm:flex">
          <Link href="/vitrine" className="hover:text-blue-600">Vitrine</Link>

          {!isLoading && empresa?.papel === "proprietario" &&
            linksProprietario.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-blue-600">
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Botão mobile */}
        <button
          aria-label="Abrir menu"
          className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Menu mobile colapsável */}
      {open && (
        <nav className="flex flex-col gap-2 border-t border-zinc-200 bg-white px-4 py-3 sm:hidden">
          <Link href="/vitrine" className="hover:text-blue-600">Vitrine</Link>
          {!isLoading && empresa?.papel === "proprietario" &&
            linksProprietario.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-blue-600">
                {link.label}
              </Link>
            ))}

        </nav>
      )}
    </header>
  );
}
