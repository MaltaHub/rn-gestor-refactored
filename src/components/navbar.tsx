"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-blue-600">
          Gestor
        </Link>

        {/* Menu desktop */}
        <nav className="hidden gap-6 text-sm font-medium text-zinc-600 sm:flex">
          <Link href="/vitrine" className="hover:text-blue-600">Vitrine</Link>
          <Link href="/estoque" className="hover:text-blue-600">Estoque</Link>
          <Link href="/configuracoes" className="hover:text-blue-600">Configurações</Link>
        </nav>

        {/* Botão mobile */}
        <button
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
          <Link href="/estoque" className="hover:text-blue-600">Estoque</Link>
          <Link href="/configuracoes" className="hover:text-blue-600">Configurações</Link>
        </nav>
      )}
    </header>
  );
}
