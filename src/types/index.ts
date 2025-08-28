export interface Vehicle {
  [key: string]: string;
}

type AuthUser = {
  id: string
  email?: string
  // adicione outros campos do user se necessário
}

export type AuthState = {
  user: AuthUser | null
  token: string | null // access_token (JWT)
  loading: boolean
  // ações
  bootstrap: () => Promise<void>
  logout: () => Promise<void>
}