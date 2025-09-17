import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PrivateRoute } from "@/components/PrivateRoute";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmpresaGuard } from "@/components/EmpresaGuard";
import { queryClient } from "@/lib/queryClient";
import { Dashboard } from "@/pages/Dashboard";
import SetupCompany from "@/pages/SetupCompany";
import Inventory from "@/pages/Inventory";
import { LoginPage } from "@/pages/LoginPage";
import Todos from "@/pages/Todos";
import Anuncios from "@/pages/Anuncios";
import Vendas from "@/pages/Vendas";
import Promocoes from "@/pages/Promocoes";
import Membros from "@/pages/Membros";
import Lojas from "@/pages/Lojas";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<PrivateRoute />}>
              <Route path="/setup/empresa" element={<SetupCompany />} />
              <Route element={<EmpresaGuard />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/estoque" element={<Inventory />} />
                  <Route path="/anuncios" element={<Anuncios />} />
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/promocoes" element={<Promocoes />} />
                  <Route path="/membros" element={<Membros />} />
                  <Route path="/lojas" element={<Lojas />} />
                  <Route path="/documentacao" element={<Todos />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionBootstrap>
    </QueryClientProvider>
  );
}

