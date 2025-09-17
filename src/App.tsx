import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { PrivateRoute } from "@/components/PrivateRoute"
import { SessionBootstrap } from "@/components/SessionBootstrap"
import { AppLayout } from "@/components/layout/AppLayout"
import { EmpresaGuard } from "@/components/EmpresaGuard"
import { queryClient } from "@/lib/queryClient"
import { Dashboard } from "@/pages/Dashboard"
import SetupCompany from "@/pages/SetupCompany"
import Inventory from "@/pages/Inventory"
import { LoginPage } from "@/pages/LoginPage"
import Anuncios from "@/pages/Anuncios"
import Vendas from "@/pages/Vendas"
import Promocoes from "@/pages/Promocoes"
import Membros from "@/pages/Membros"
import Lojas from "@/pages/Lojas"
import LandingPage from "@/pages/LandingPage"
import JoinCompany from "@/pages/JoinCompany"
import NotFound from "@/pages/NotFound"
import RegisterVehicle from "@/pages/RegisterVehicle"
import EditVehicle from "@/pages/EditVehicle"
import VehicleDetails from "@/pages/VehicleDetails"

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/convites/:token" element={<JoinCompany />} />

            <Route element={<PrivateRoute />}>
              <Route path="/setup/empresa" element={<SetupCompany />} />
              <Route element={<EmpresaGuard />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="estoque" element={<Inventory />} />
                  <Route path="estoque/cadastrar" element={<RegisterVehicle />} />
                  <Route path="veiculos/:vehicleId" element={<VehicleDetails />} />
                  <Route path="veiculos/:vehicleId/editar" element={<EditVehicle />} />
                  <Route path="anuncios" element={<Anuncios />} />
                  <Route path="vendas" element={<Vendas />} />
                  <Route path="promocoes" element={<Promocoes />} />
                  <Route path="membros" element={<Membros />} />
                  <Route path="lojas" element={<Lojas />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionBootstrap>
    </QueryClientProvider>
  )
}
