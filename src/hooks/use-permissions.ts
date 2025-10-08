/**
 * usePermissions Hook
 * Hook para verificar permissões no React
 */

import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permission.service';
import { Permission } from '@/types/rbac';
import { useAuth } from './use-auth';
import { useEmpresaDoUsuario } from './use-empresa';

export function usePermissions() {
  const { user } = useAuth();
  const { data: membro } = useEmpresaDoUsuario();

  const empresaId = membro?.empresa_id;
  const userId = user?.id;

  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ['permissions', userId, empresaId],
    queryFn: () => {
      if (!userId || !empresaId) return null;
      return permissionService.getUserPermissions(userId, empresaId);
    },
    enabled: !!userId && !!empresaId,
    staleTime: 5 * 60 * 1000,
  });

  const hasPermission = (permission: Permission): boolean => {
    if (!userPermissions) return false;
    return userPermissions.permissions.includes(permission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userPermissions) return false;
    return permissions.every(p => userPermissions.permissions.includes(p));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userPermissions) return false;
    return permissions.some(p => userPermissions.permissions.includes(p));
  };

  const isAdmin = (): boolean => {
    if (!userPermissions) return false;
    return userPermissions.role === 'proprietario' || 
           userPermissions.role === 'administrador';
  };

  const isOwner = (): boolean => {
    if (!userPermissions) return false;
    return userPermissions.role === 'proprietario';
  };

  return {
    permissions: userPermissions?.permissions || [],
    role: userPermissions?.role,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isOwner,
    isLoading,
  };
}
