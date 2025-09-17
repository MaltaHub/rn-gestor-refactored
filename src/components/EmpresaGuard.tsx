import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

export function EmpresaGuard() {
  const location = useLocation();
  const { empresaId, loading } = useAuthStore();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm">Carregando...</div>;
  }

  if (!empresaId) {
    return <Navigate to="/setup/empresa" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
