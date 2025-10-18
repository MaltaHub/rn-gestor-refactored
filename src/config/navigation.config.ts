/**
 * Configuração de Navegação com RBAC
 * Define todos os itens de menu e suas permissões necessárias
 */

import {
  LayoutGrid,
  Package,
  Settings,
  Shield,
  Bell,
  User,
  Plus,
  LineChart,
  type LucideIcon,
} from 'lucide-react';
import { Permission } from '@/types/rbac';

export interface NavConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  permissions?: Permission[];
  requiresAny?: boolean; // true = qualquer uma das permissões, false/undefined = todas as permissões
  adminOnly?: boolean;
  ownerOnly?: boolean;
  showWhen?: 'always' | 'authenticated' | 'unauthenticated';
}

export const NAV_ITEMS: NavConfig[] = [
  {
    href: '/vitrine',
    label: 'Vitrine',
    icon: LayoutGrid,
    showWhen: 'always',
  },
  {
    href: '/estoque',
    label: 'Estoque',
    icon: Package,
    permissions: [Permission.ESTOQUE_VISUALIZAR],
    showWhen: 'authenticated',
  },
  {
    href: '/vendas',
    label: 'Vendas',
    icon: LineChart,
    permissions: [Permission.VENDAS_VISUALIZAR],
    showWhen: 'authenticated',
  },
  {
    href: '/criar',
    label: 'Criar Veículo',
    icon: Plus,
    permissions: [Permission.ESTOQUE_CRIAR],
    showWhen: 'authenticated',
  },
  {
    href: '/notificacoes',
    label: 'Notificações',
    icon: Bell,
    permissions: [Permission.NOTIFICACOES_VISUALIZAR],
    showWhen: 'authenticated',
  },
  {
    href: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    permissions: [
      Permission.CONFIG_VISUALIZAR,
      Permission.CONFIG_EDITAR,
      Permission.CONFIG_MODELOS,
      Permission.CONFIG_CARACTERISTICAS,
    ],
    requiresAny: true, // Precisa de pelo menos uma dessas permissões
    showWhen: 'authenticated',
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: Shield,
    adminOnly: true,
    showWhen: 'authenticated',
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: User,
    showWhen: 'authenticated',
  },
];

/**
 * Filtra itens de navegação baseado em:
 * - Status de autenticação
 * - Permissões do usuário
 * - Papel do usuário (admin/owner)
 */
export function filterNavItems(
  items: NavConfig[],
  {
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isOwner,
  }: {
    isAuthenticated: boolean;
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    isAdmin: () => boolean;
    isOwner: () => boolean;
  }
): NavConfig[] {
  return items.filter((item) => {
    // Verifica showWhen
    if (item.showWhen === 'authenticated' && !isAuthenticated) return false;
    if (item.showWhen === 'unauthenticated' && isAuthenticated) return false;

    // Verifica se é só para owners
    if (item.ownerOnly && !isOwner()) return false;

    // Verifica se é só para admins
    if (item.adminOnly && !isAdmin()) return false;

    // Verifica permissões
    if (item.permissions && item.permissions.length > 0) {
      if (item.requiresAny) {
        // Precisa de pelo menos uma permissão
        if (!hasAnyPermission(item.permissions)) return false;
      } else {
        // Precisa de todas as permissões
        const hasAll = item.permissions.every((p) => hasPermission(p));
        if (!hasAll) return false;
      }
    }

    return true;
  });
}

/**
 * Constantes de permissões agrupadas por contexto
 * Facilita o uso em componentes
 */
export const PERMISSION_GROUPS = {
  ESTOQUE_FULL: [
    Permission.ESTOQUE_CRIAR,
    Permission.ESTOQUE_EDITAR,
    Permission.ESTOQUE_DELETAR,
    Permission.ESTOQUE_VISUALIZAR,
  ],
  VITRINE_FULL: [
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.VITRINE_VISUALIZAR,
  ],
  VENDAS_FULL: [
    Permission.VENDAS_CRIAR,
    Permission.VENDAS_EDITAR,
    Permission.VENDAS_CANCELAR,
    Permission.VENDAS_VISUALIZAR,
  ],
  CONFIG_FULL: [
    Permission.CONFIG_EDITAR,
    Permission.CONFIG_VISUALIZAR,
    Permission.CONFIG_MODELOS,
    Permission.CONFIG_CARACTERISTICAS,
    Permission.CONFIG_LOCAIS,
    Permission.CONFIG_PLATAFORMAS,
  ],
  FOTOS_FULL: [
    Permission.FOTOS_UPLOAD,
    Permission.FOTOS_DELETAR,
    Permission.FOTOS_EDITAR_ORDEM,
    Permission.FOTOS_VISUALIZAR,
  ],
} as const;
