"use client";

import Image from "next/image";

export function TopLogo() {
  return (
    <div className="top-logo">
      <button
        className="top-logo__button"
        type="button"
        onClick={() => window.location.reload()}
        aria-label="Atualizar página"
      >
        <Image
          src="/icons/logo-deitada.png"
          alt="Logo Gestor"
          width={252}
          height={64}
          style={{ width: "auto", height: "64px" }}
          priority
        />
      </button>
    </div>
  );
}
