"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { data: empresa, isLoading } = useEmpresaDoUsuario(isAuthenticated);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLinkClick = () => setOpen(false);

  const linksProprietario = [
    { href: "/admin", label: "Admin" },
    { href: "/estoque", label: "Estoque" },
    { href: "/configuracoes", label: "Configurações" },
  ];


  return (
    <header className="relative w-full border-b theme-border theme-surface shadow-sm">
      <Link
        href="/"
        className="absolute left-4 top-1/2 hidden h-27 w-27 -translate-y-1/2 items-center sm:flex"
        aria-label="Página inicial"
        onClick={handleLinkClick}
      >
        <span className="relative block h-full w-full overflow-hidden">
          <Image
            src="/logo-deitada.png"
            alt="Logo do RN Gestor"
            fill
            priority
            draggable={false}
            sizes="400px"
            className="object-contain"
          />
        </span>
      </Link>

      {!open && (
        <Link
          href="/"
          className="absolute left-4 top-1/2 flex h-[140px] w-[140px] -translate-y-1/2 items-center sm:hidden"
          aria-label="Página inicial"
          onClick={handleLinkClick}
        >
          <span className="relative block h-full w-full">
            <Image
              src="/logo-deitada.png"
              alt="Logo do RN Gestor"
              fill
              priority
              draggable={false}
              sizes="260px"
              className="object-contain drop-shadow-lg"
            />
          </span>
        </Link>
      )}

      <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-3 pl-32 sm:px-6 sm:pl-60 lg:px-8">
        {/* Menu desktop */}
        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          <Link href="/vitrine" className="hover:text-blue-600" onClick={handleLinkClick}>
            Vitrine
          </Link>
          {!authLoading && isAuthenticated && !isLoading && empresa?.papel === "proprietario" &&
            linksProprietario.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-600"
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Botão mobile (fica à direita também) */}
        <button
          aria-label="Abrir menu"
          className="ml-4 rounded-md p-2 hover:bg-zinc-100 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Menu mobile colapsável */}
      {open && (
        <nav className="flex flex-col gap-2 border-t theme-border theme-surface px-4 py-3 sm:hidden">
          <Link href="/vitrine" className="hover:text-blue-600" onClick={handleLinkClick}>
            Vitrine
          </Link>
          {!authLoading && isAuthenticated && !isLoading && empresa?.papel === "proprietario" &&
            linksProprietario.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-600"
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
        </nav>
      )}
    </header>
  );
}
