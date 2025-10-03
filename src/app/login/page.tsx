import { Suspense } from "react";
import LoginClient from "./LoginCliente";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando página de login...</div>}>
      <LoginClient />
    </Suspense>
  );
}
