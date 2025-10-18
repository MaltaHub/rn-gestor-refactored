'use client';

/**
 * PermissionButton
 * Botão que se auto-desabilita/oculta baseado em permissões
 */

import { ReactNode, forwardRef, ButtonHTMLAttributes } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/types/rbac';
import { ShieldOff } from 'lucide-react';

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  hideWhenDenied?: boolean; // Se true, oculta o botão; se false, apenas desabilita
  disabledTooltip?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
}

export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  (
    {
      children,
      permission,
      permissions,
      requireAll = false,
      adminOnly = false,
      ownerOnly = false,
      hideWhenDenied = false,
      disabledTooltip,
      variant = 'primary',
      disabled: externalDisabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const {
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      isAdmin,
      isOwner,
      isLoading,
    } = usePermissions();

    // Verifica permissões
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
    const isDisabled = externalDisabled || isLoading || !hasAccess;

    // Oculta o botão se configurado
    if (hideWhenDenied && !hasAccess && !isLoading) {
      return null;
    }

    // Estilos por variante
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400',
      ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-gray-400',
    };

    const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed';

    const button = (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Carregando...
          </>
        ) : !hasAccess ? (
          <>
            <ShieldOff className="w-4 h-4" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );

    // Adiciona tooltip se o botão está desabilitado por permissão
    if (!hasAccess && !isLoading && disabledTooltip) {
      return (
        <div className="relative group inline-block">
          {button}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {disabledTooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      );
    }

    return button;
  }
);

PermissionButton.displayName = 'PermissionButton';
