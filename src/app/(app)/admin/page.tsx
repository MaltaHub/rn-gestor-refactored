import { Suspense } from "react";

import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Carregando painel administrativo...</div>}>
      <AdminClient />
    </Suspense>
  );
}
