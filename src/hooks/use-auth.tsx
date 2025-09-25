"use client";

import { createContext, useCallback, useContext, useState } from "react";

import type { LoginCredentials, LoginResult } from "@/components/auth/auth-types";

interface AuthContextValue {
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthContextProviderProps {
  value: AuthContextValue;
  children: React.ReactNode;
}

export function AuthContextProvider({ value, children }: AuthContextProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider.");
  }

  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      setError(null);
      setIsAuthenticating(true);
      try {
        const resultado = await context.login(credentials);
        if (!resultado.ok) {
          setError(resultado.error ?? "Falha ao autenticar. Verifique as credenciais.");
        }
        return resultado;
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Falha inesperada ao autenticar.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [context]
  );

  const logout = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await context.logout();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Falha ao encerrar sessão.";
      setError(message);
      throw caught;
    } finally {
      setIsSigningOut(false);
    }
  }, [context]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    logout,
    error,
    clearError,
    isAuthenticating,
    isSigningOut
  };
}
