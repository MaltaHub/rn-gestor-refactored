import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

// Componente "guardião" que inicializa a sessão ao subir a app
export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const { loading, bootstrap } = useAuthStore()

  useEffect(() => {
    // inicia leitura + listener de sessão
    bootstrap()
  }, [bootstrap])

  if (loading) return <div>Carregando sessão...</div>

  return <>{children}</>
}