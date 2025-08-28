import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionBootstrap } from './components/SessionBootstrap'
import { PrivateRoute } from './components/PrivateRoute'
import { Dashboard } from './pages/Dashboard'
import { LoginPage } from './pages/LoginPage'
import { Inventory } from './pages/Inventory'
import Todos from './pages/Todos'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<PrivateRoute />}> {/* rotas protegidas */}
              <Route path="/" element={<Dashboard />} />
              {/* outras rotas privadas */}
            </Route>

            <Route element={<PrivateRoute />}> {/* rotas protegidas */}
              <Route path="/inventario" element={<Inventory />} />
              <Route path="/todos" element={<Todos />} />
              {/* outras rotas privadas */}
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionBootstrap>
    </QueryClientProvider>
  )
}
