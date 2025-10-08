/**
 * PermissionService
 * Serviço centralizado para verificação de permissões
 */

import { supabase } from '@/lib/supabase';
import { PermissionRepository } from '@/repositories';
import { 
  Permission, 
  ROLE_PERMISSIONS, 
  UserRole, 
  UserPermissions,
  PermissionCheck 
} from '@/types/rbac';
import { Database } from '@/types/supabase';

type MembroEmpresa = Database['public']['Tables']['membros_empresa']['Row'];

export class PermissionService {
  private permissionRepo: PermissionRepository;

  constructor() {
    this.permissionRepo = new PermissionRepository(supabase);
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  async checkPermission(
    userId: string,
    empresaId: string,
    permission: Permission
  ): Promise<PermissionCheck> {
    try {
      const membro = await this.getMemberRole(userId, empresaId);

      if (!membro) {
        return {
          hasPermission: false,
          reason: 'Usuário não é membro da empresa',
        };
      }

      if (!membro.ativo) {
        return {
          hasPermission: false,
          role: membro.papel || undefined,
          reason: 'Usuário está inativo na empresa',
        };
      }

      const role = membro.papel as UserRole;
      const rolePermissions = ROLE_PERMISSIONS[role] || [];

      const hasPermission = rolePermissions.includes(permission);

      const dbPermission = await this.permissionRepo.checkPermission(
        role,
        empresaId,
        permission
      );

      return {
        hasPermission: hasPermission || dbPermission,
        role,
      };
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return {
        hasPermission: false,
        reason: 'Erro ao verificar permissão',
      };
    }
  }

  /**
   * Verifica múltiplas permissões (todas devem ser verdadeiras)
   */
  async checkAllPermissions(
    userId: string,
    empresaId: string,
    permissions: Permission[]
  ): Promise<PermissionCheck> {
    const checks = await Promise.all(
      permissions.map(p => this.checkPermission(userId, empresaId, p))
    );

    const allHavePermission = checks.every(check => check.hasPermission);

    return {
      hasPermission: allHavePermission,
      role: checks[0]?.role,
      reason: allHavePermission ? undefined : 'Uma ou mais permissões negadas',
    };
  }

  /**
   * Verifica se o usuário tem pelo menos uma das permissões
   */
  async checkAnyPermission(
    userId: string,
    empresaId: string,
    permissions: Permission[]
  ): Promise<PermissionCheck> {
    const checks = await Promise.all(
      permissions.map(p => this.checkPermission(userId, empresaId, p))
    );

    const hasAnyPermission = checks.some(check => check.hasPermission);

    return {
      hasPermission: hasAnyPermission,
      role: checks[0]?.role,
      reason: hasAnyPermission ? undefined : 'Nenhuma permissão encontrada',
    };
  }

  /**
   * Obtém todas as permissões de um usuário
   */
  async getUserPermissions(
    userId: string,
    empresaId: string
  ): Promise<UserPermissions | null> {
    try {
      const membro = await this.getMemberRole(userId, empresaId);

      if (!membro || !membro.ativo || !membro.papel) {
        return null;
      }

      const role = membro.papel as UserRole;
      const permissions = ROLE_PERMISSIONS[role] || [];

      const dbPermissions = await this.permissionRepo.findByRoleAndEmpresa(
        role,
        empresaId
      );

      const extraPermissions = dbPermissions
        .filter(p => p.permitido)
        .map(p => p.operacao as Permission);

      const allPermissions = Array.from(
        new Set([...permissions, ...extraPermissions])
      );

      return {
        role,
        permissions: allPermissions,
        empresaId,
      };
    } catch (error) {
      console.error('Erro ao obter permissões do usuário:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário tem papel de proprietário ou administrador
   */
  async isAdmin(userId: string, empresaId: string): Promise<boolean> {
    const membro = await this.getMemberRole(userId, empresaId);
    return membro?.papel === 'proprietario' || membro?.papel === 'administrador';
  }

  /**
   * Busca o papel do membro na empresa
   */
  private async getMemberRole(
    userId: string,
    empresaId: string
  ): Promise<MembroEmpresa | null> {
    const { data, error } = await supabase
      .from('membros_empresa')
      .select('*')
      .eq('usuario_id', userId)
      .eq('empresa_id', empresaId)
      .single();

    if (error || !data) return null;
    return data;
  }
}

export const permissionService = new PermissionService();
