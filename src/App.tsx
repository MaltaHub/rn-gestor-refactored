<<<<<<< HEAD
﻿import { QueryClientProvider } from "@tanstack/react-query";
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
=======
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionBootstrap } from './components/SessionBootstrap'
import { PrivateRoute } from './components/PrivateRoute'
import { LoginPage } from './pages/LoginPage'
import { Inventory } from './pages/Inventory'
import Todos from './pages/Todos'
import EditVehicle from './pages/EditVehicle'
import RegisterVehicle from './pages/RegisterVehicle'
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

<<<<<<< HEAD
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
=======
              <Route element={<PrivateRoute />}> {/* rotas protegidas */}
                <Route path="/" element={<Todos table_name="veiculos" />} />
                <Route path="/editar/:id" element={<EditVehicle />} />
                <Route path="/inventario" element={<Inventory />} />
                <Route path="/registrar" element={<RegisterVehicle />} />
              </Route>
            </Routes>
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3
        </BrowserRouter>
      </SessionBootstrap>
    </QueryClientProvider>
  );
}

