'use client';

/**
 * PagePermissionGuard
 * Componente para proteger páginas inteiras com base em permissões
 * Redireciona para página de acesso negado se não tiver permissão
 */

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/types/rbac';
import { AlertCircle, ShieldOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PagePermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  redirectTo?: string;
  showDenied?: boolean; // Se true, mostra UI de acesso negado; se false, redireciona
}

export function PagePermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  adminOnly = false,
  ownerOnly = false,
  redirectTo = '/vitrine',
  showDenied = true,
}: PagePermissionGuardProps) {
  const router = useRouter();
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isOwner,
    isLoading,
    role,
  } = usePermissions();

  // Verifica se tem permissão
  const checkPermission = (): boolean => {
    if (ownerOnly && !isOwner()) return false;
    if (adminOnly && !isAdmin()) return false;

    if (permission && !hasPermission(permission)) return false;

    if (permissions && permissions.length > 0) {
      if (requireAll) {
        if (!hasAllPermissions(permissions)) return false;
      } else {
        if (!hasAnyPermission(permissions)) return false;
      }
    }

    return true;
  };

  const hasAccess = checkPermission();

  useEffect(() => {
    if (!isLoading && !hasAccess && !showDenied) {
      router.push(redirectTo);
    }
  }, [isLoading, hasAccess, router, redirectTo, showDenied]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (showDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <ShieldOff className="w-20 h-20 text-red-500 mx-auto mb-6" />

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Acesso Negado
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Você não tem permissão para acessar esta página.
            </p>

            {role && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Seu papel:</strong> {role}
                </p>
                {permission && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <strong>Permissão necessária:</strong> {permission}
                  </p>
                )}
                {permissions && permissions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Permissões necessárias:</strong>
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                      {permissions.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Entre em contato com um administrador se você acredita que deveria ter acesso a esta página.
              </p>
            </div>

            <div className="mt-8 flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <Link
                href="/vitrine"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return null; // Aguarda redirecionamento
  }

  return <>{children}</>;
}
