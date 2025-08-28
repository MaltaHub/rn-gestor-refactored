import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // timeout opcional
})

// Interceptor que injeta o access_token JWT em todas as requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// (Opcional) Interceptor de resposta para tratar 401 e tentar fluxo de sign-out/redirect
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      // Caso o access_token tenha expirado e o autoRefresh ainda não aplicou,
      // podemos apenas confiar no próximo ciclo do onAuthStateChange ou deslogar.
      // Aqui vamos deslogar por segurança.
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)