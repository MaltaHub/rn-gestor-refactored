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
  // Veículos (compatibilidade)
  VEICULOS_CRIAR = 'veiculos:criar',
  VEICULOS_EDITAR = 'veiculos:editar',
  VEICULOS_DELETAR = 'veiculos:deletar',
  VEICULOS_VISUALIZAR = 'veiculos:visualizar',

  // Estoque
  ESTOQUE_CRIAR = 'estoque:criar',
  ESTOQUE_EDITAR = 'estoque:editar',
  ESTOQUE_DELETAR = 'estoque:deletar',
  ESTOQUE_VISUALIZAR = 'estoque:visualizar',
  ESTOQUE_EXPORTAR = 'estoque:exportar',

  // Vitrine
  VITRINE_ADICIONAR = 'vitrine:adicionar',
  VITRINE_REMOVER = 'vitrine:remover',
  VITRINE_EDITAR_PRECO = 'vitrine:editar_preco',
  VITRINE_VISUALIZAR = 'vitrine:visualizar',

  // Vendas
  VENDAS_CRIAR = 'vendas:criar',
  VENDAS_EDITAR = 'vendas:editar',
  VENDAS_CANCELAR = 'vendas:cancelar',
  VENDAS_VISUALIZAR = 'vendas:visualizar',
  VENDAS_RELATORIOS = 'vendas:relatorios',

  // Documentação
  DOCUMENTACAO_EDITAR = 'documentacao:editar',
  DOCUMENTACAO_VISUALIZAR = 'documentacao:visualizar',
  DOCUMENTACAO_ANEXOS = 'documentacao:anexos',

  // Notificações
  NOTIFICACOES_ENVIAR = 'notificacoes:enviar',
  NOTIFICACOES_VISUALIZAR = 'notificacoes:visualizar',
  NOTIFICACOES_GERENCIAR = 'notificacoes:gerenciar',

  // Fotos
  FOTOS_UPLOAD = 'fotos:upload',
  FOTOS_DELETAR = 'fotos:deletar',
  FOTOS_EDITAR_ORDEM = 'fotos:editar_ordem',
  FOTOS_VISUALIZAR = 'fotos:visualizar',

  // Lojas
  LOJAS_CRIAR = 'lojas:criar',
  LOJAS_EDITAR = 'lojas:editar',
  LOJAS_DELETAR = 'lojas:deletar',
  LOJAS_VISUALIZAR = 'lojas:visualizar',

  // Configurações
  CONFIG_EDITAR = 'config:editar',
  CONFIG_VISUALIZAR = 'config:visualizar',
  CONFIG_MODELOS = 'config:modelos',
  CONFIG_CARACTERISTICAS = 'config:caracteristicas',
  CONFIG_LOCAIS = 'config:locais',
  CONFIG_PLATAFORMAS = 'config:plataformas',

  // Membros
  MEMBROS_CONVIDAR = 'membros:convidar',
  MEMBROS_REMOVER = 'membros:remover',
  MEMBROS_EDITAR_PAPEL = 'membros:editar_papel',
  MEMBROS_VISUALIZAR = 'membros:visualizar',

  // Admin
  ADMIN_FULL_ACCESS = 'admin:full_access',
  ADMIN_PERMISSOES = 'admin:permissoes',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  proprietario: [
    // Todas as permissões de veículos/estoque
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_DELETAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.ESTOQUE_CRIAR,
    Permission.ESTOQUE_EDITAR,
    Permission.ESTOQUE_DELETAR,
    Permission.ESTOQUE_VISUALIZAR,
    Permission.ESTOQUE_EXPORTAR,
    // Vitrine
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.VITRINE_VISUALIZAR,
    // Vendas
    Permission.VENDAS_CRIAR,
    Permission.VENDAS_EDITAR,
    Permission.VENDAS_CANCELAR,
    Permission.VENDAS_VISUALIZAR,
    Permission.VENDAS_RELATORIOS,
    // Documentação
    Permission.DOCUMENTACAO_EDITAR,
    Permission.DOCUMENTACAO_VISUALIZAR,
    Permission.DOCUMENTACAO_ANEXOS,
    // Notificações
    Permission.NOTIFICACOES_ENVIAR,
    Permission.NOTIFICACOES_VISUALIZAR,
    Permission.NOTIFICACOES_GERENCIAR,
    // Fotos
    Permission.FOTOS_UPLOAD,
    Permission.FOTOS_DELETAR,
    Permission.FOTOS_EDITAR_ORDEM,
    Permission.FOTOS_VISUALIZAR,
    // Lojas
    Permission.LOJAS_CRIAR,
    Permission.LOJAS_EDITAR,
    Permission.LOJAS_DELETAR,
    Permission.LOJAS_VISUALIZAR,
    // Configurações
    Permission.CONFIG_EDITAR,
    Permission.CONFIG_VISUALIZAR,
    Permission.CONFIG_MODELOS,
    Permission.CONFIG_CARACTERISTICAS,
    Permission.CONFIG_LOCAIS,
    Permission.CONFIG_PLATAFORMAS,
    // Membros
    Permission.MEMBROS_CONVIDAR,
    Permission.MEMBROS_REMOVER,
    Permission.MEMBROS_EDITAR_PAPEL,
    Permission.MEMBROS_VISUALIZAR,
    // Admin
    Permission.ADMIN_FULL_ACCESS,
    Permission.ADMIN_PERMISSOES,
  ],
  administrador: [
    // Estoque completo
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_DELETAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.ESTOQUE_CRIAR,
    Permission.ESTOQUE_EDITAR,
    Permission.ESTOQUE_DELETAR,
    Permission.ESTOQUE_VISUALIZAR,
    Permission.ESTOQUE_EXPORTAR,
    // Vitrine
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.VITRINE_VISUALIZAR,
    // Vendas
    Permission.VENDAS_CRIAR,
    Permission.VENDAS_EDITAR,
    Permission.VENDAS_CANCELAR,
    Permission.VENDAS_VISUALIZAR,
    Permission.VENDAS_RELATORIOS,
    // Documentação
    Permission.DOCUMENTACAO_EDITAR,
    Permission.DOCUMENTACAO_VISUALIZAR,
    Permission.DOCUMENTACAO_ANEXOS,
    // Notificações
    Permission.NOTIFICACOES_ENVIAR,
    Permission.NOTIFICACOES_VISUALIZAR,
    Permission.NOTIFICACOES_GERENCIAR,
    // Fotos
    Permission.FOTOS_UPLOAD,
    Permission.FOTOS_DELETAR,
    Permission.FOTOS_EDITAR_ORDEM,
    Permission.FOTOS_VISUALIZAR,
    // Lojas (sem deletar)
    Permission.LOJAS_CRIAR,
    Permission.LOJAS_EDITAR,
    Permission.LOJAS_VISUALIZAR,
    // Configurações
    Permission.CONFIG_EDITAR,
    Permission.CONFIG_VISUALIZAR,
    Permission.CONFIG_MODELOS,
    Permission.CONFIG_CARACTERISTICAS,
    Permission.CONFIG_LOCAIS,
    Permission.CONFIG_PLATAFORMAS,
    // Membros (sem remover)
    Permission.MEMBROS_CONVIDAR,
    Permission.MEMBROS_VISUALIZAR,
  ],
  gerente: [
    // Estoque completo
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.ESTOQUE_CRIAR,
    Permission.ESTOQUE_EDITAR,
    Permission.ESTOQUE_VISUALIZAR,
    Permission.ESTOQUE_EXPORTAR,
    // Vitrine
    Permission.VITRINE_ADICIONAR,
    Permission.VITRINE_REMOVER,
    Permission.VITRINE_EDITAR_PRECO,
    Permission.VITRINE_VISUALIZAR,
    // Vendas
    Permission.VENDAS_CRIAR,
    Permission.VENDAS_EDITAR,
    Permission.VENDAS_VISUALIZAR,
    Permission.VENDAS_RELATORIOS,
    // Documentação
    Permission.DOCUMENTACAO_EDITAR,
    Permission.DOCUMENTACAO_VISUALIZAR,
    Permission.DOCUMENTACAO_ANEXOS,
    // Notificações
    Permission.NOTIFICACOES_VISUALIZAR,
    // Fotos
    Permission.FOTOS_UPLOAD,
    Permission.FOTOS_EDITAR_ORDEM,
    Permission.FOTOS_VISUALIZAR,
    // Lojas (visualizar)
    Permission.LOJAS_VISUALIZAR,
    // Configurações (visualizar + modelos)
    Permission.CONFIG_VISUALIZAR,
    Permission.CONFIG_MODELOS,
    Permission.CONFIG_CARACTERISTICAS,
    // Membros
    Permission.MEMBROS_VISUALIZAR,
  ],
  consultor: [
    // Estoque (criar e editar apenas)
    Permission.VEICULOS_CRIAR,
    Permission.VEICULOS_EDITAR,
    Permission.VEICULOS_VISUALIZAR,
    Permission.ESTOQUE_CRIAR,
    Permission.ESTOQUE_EDITAR,
    Permission.ESTOQUE_VISUALIZAR,
    // Vitrine (editar preço)
    Permission.VITRINE_EDITAR_PRECO,
    Permission.VITRINE_VISUALIZAR,
    // Vendas
    Permission.VENDAS_CRIAR,
    Permission.VENDAS_VISUALIZAR,
    // Documentação
    Permission.DOCUMENTACAO_VISUALIZAR,
    // Notificações
    Permission.NOTIFICACOES_VISUALIZAR,
    // Fotos
    Permission.FOTOS_UPLOAD,
    Permission.FOTOS_VISUALIZAR,
    // Lojas
    Permission.LOJAS_VISUALIZAR,
    // Configurações
    Permission.CONFIG_VISUALIZAR,
  ],
  usuario: [
    // Apenas visualizações básicas
    Permission.VEICULOS_VISUALIZAR,
    Permission.ESTOQUE_VISUALIZAR,
    Permission.VITRINE_VISUALIZAR,
    Permission.VENDAS_VISUALIZAR,
    Permission.DOCUMENTACAO_VISUALIZAR,
    Permission.NOTIFICACOES_VISUALIZAR,
    Permission.FOTOS_VISUALIZAR,
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
