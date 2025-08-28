import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Uso 1: como wrapper de rota (element={<PrivateRoute/>}) + <Outlet />
export function PrivateRoute() {
  const { user, token, loading } = useAuthStore()

  if (loading) return <div>Carregando...</div>
  if (!user || !token) return <Navigate to="/login" replace />

  return <Outlet />
}