/**
 * useRoutePermission Hook
 * Hook para verificar permissões programaticamente e proteger rotas
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from './use-permissions';
import { Permission } from '@/types/rbac';

interface UseRoutePermissionOptions {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  redirectTo?: string;
  autoRedirect?: boolean;
}

export function useRoutePermission({
  permission,
  permissions,
  requireAll = false,
  adminOnly = false,
  ownerOnly = false,
  redirectTo = '/vitrine',
  autoRedirect = false,
}: UseRoutePermissionOptions = {}) {
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

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) {
      setHasAccess(null);
      return;
    }

    let access = true;

    // Verifica owner
    if (ownerOnly && !isOwner()) {
      access = false;
    }

    // Verifica admin
    if (adminOnly && !isAdmin()) {
      access = false;
    }

    // Verifica permissão única
    if (permission && !hasPermission(permission)) {
      access = false;
    }

    // Verifica múltiplas permissões
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        if (!hasAllPermissions(permissions)) {
          access = false;
        }
      } else {
        if (!hasAnyPermission(permissions)) {
          access = false;
        }
      }
    }

    setHasAccess(access);

    // Redireciona automaticamente se configurado
    if (autoRedirect && !access) {
      router.push(redirectTo);
    }
  }, [
    isLoading,
    ownerOnly,
    adminOnly,
    permission,
    permissions,
    requireAll,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isOwner,
    autoRedirect,
    redirectTo,
    router,
  ]);

  return {
    hasAccess,
    isLoading,
    role,
    redirect: () => router.push(redirectTo),
  };
}
