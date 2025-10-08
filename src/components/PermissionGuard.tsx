'use client';

/**
 * PermissionGuard
 * Componente para proteger UI com base em permissões
 */

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/types/rbac';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  adminOnly?: boolean;
  ownerOnly?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  adminOnly = false,
  ownerOnly = false,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isOwner,
    isLoading,
  } = usePermissions();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (ownerOnly && !isOwner()) {
    return <>{fallback}</>;
  }

  if (adminOnly && !isAdmin()) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
