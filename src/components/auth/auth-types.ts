export type DestinoPosLogin = "/app" | "/lobby";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  ok: boolean;
  destino?: DestinoPosLogin;
  error?: string;
}
