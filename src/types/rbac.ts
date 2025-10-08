/**
 * Tipos para RBAC (Role-Based Access Control)
 */

import { Database } from './supabase';

export type UserRole = Database['public']['Enums']['papel_usuario_empresa'];

export const ROLES: Record<string, UserRole> = {
  OWNER: 'proprietario',
  ADMIN: 'administrador',
  MANAGER: 'gerente',
  CONSULTANT: 'consultor',
  USER: 'usuario',
} as const;

export enum Permission {
  VEICULOS_CRIAR = 'veiculos:criar',
  VEICULOS_EDITAR = 'veiculos:editar',
  VEICULOS_DELETAR = 'veiculos:deletar',
  VEICULOS_VISUALIZAR = 'veiculos:visualizar',
  
  VITRINE_ADICIONAR = 'vitrine:adicionar',
  VITRINE_REMOVER = 'vitrine:remover',
  VITRINE_EDITAR_PRECO = 'vitrine:editar_preco',
  
  LOJAS_CRIAR = 'lojas:criar',
  LOJAS_EDITAR = 'lojas:editar',
  LOJAS_DELETAR = 'lojas:deletar',
  LOJAS_VISUALIZAR = 'lojas:visualizar',
  
  CONFIG_EDITAR = 'config:editar',
  CONFIG_VISUALIZAR = 'config:visualizar',
  
  MEMBROS_CONVIDAR = 'membros:convidar',
  MEMBROS_REMOVER = 'membros:remover',
  MEMBROS_EDITAR_PAPEL = 'membros:editar_papel',
  MEMBROS_VISUALIZAR = 'membros:visualizar',
  
  ADMIN_FULL_ACCESS = 'admin:full_access',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  proprietario: [
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_DELETAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.LOJAS_CRIAR,
    Permission.LOJAS_EDITAR,
    Permission.LOJAS_DELETAR,
    Permission.LOJAS_VISUALIZAR,
    Permission.CONFIG_EDITAR,
    Permission.CONFIG_VISUALIZAR,
    Permission.MEMBROS_CONVIDAR,
    Permission.MEMBROS_REMOVER,
    Permission.MEMBROS_EDITAR_PAPEL,
    Permission.MEMBROS_VISUALIZAR,
    Permission.ADMIN_FULL_ACCESS,
  ],
  administrador: [
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_DELETAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.LOJAS_CRIAR,
    Permission.LOJAS_EDITAR,
    Permission.LOJAS_VISUALIZAR,
    Permission.CONFIG_EDITAR,
    Permission.CONFIG_VISUALIZAR,
    Permission.MEMBROS_CONVIDAR,
    Permission.MEMBROS_VISUALIZAR,
  ],
  gerente: [
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.LOJAS_VISUALIZAR,
    Permission.CONFIG_VISUALIZAR,
    Permission.MEMBROS_VISUALIZAR,
  ],
  consultor: [
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.LOJAS_VISUALIZAR,
    Permission.CONFIG_VISUALIZAR,
  ],
  usuario: [
    Permission.VEICULOS_VISUALIZAR,
    Permission.LOJAS_VISUALIZAR,
    Permission.CONFIG_VISUALIZAR,
  ],
};

export interface PermissionCheck {
  hasPermission: boolean;
  role?: UserRole;
  reason?: string;
}

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
  empresaId: string;
}
