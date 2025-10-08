'use client';

/**
 * Exemplo de uso do sistema RBAC
 * 
 * Este arquivo demonstra como usar:
 * - usePermissions hook
 * - PermissionGuard component
 * - Verificação de permissões
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/types/rbac';
import { Plus, Edit, Trash, Settings } from 'lucide-react';

export function RBACExample() {
  const { 
    permissions, 
    role, 
    hasPermission, 
    isAdmin, 
    isOwner,
    isLoading 
  } = usePermissions();

  if (isLoading) {
    return <div>Carregando permissões...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <Card.Header
          title="Sistema RBAC - Exemplo de Uso"
          subtitle="Demonstração de controle de acesso baseado em roles"
        />
        
        <Card.Body>
          <div className="space-y-4">
            
            <div>
              <h3 className="font-semibold mb-2">Seu Papel:</h3>
              <Badge variant="info" size="md">
                {role ? role.toUpperCase() : 'Sem papel'}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status Admin:</h3>
              <Badge variant={isAdmin() ? 'success' : 'default'}>
                {isAdmin() ? 'É Admin' : 'Não é Admin'}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status Proprietário:</h3>
              <Badge variant={isOwner() ? 'success' : 'default'}>
                {isOwner() ? 'É Proprietário' : 'Não é Proprietário'}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Botões com PermissionGuard:</h3>
              <div className="flex gap-2 flex-wrap">
                
                <PermissionGuard 
                  permission={Permission.VEICULOS_CRIAR}
                  fallback={
                    <Button variant="outline" disabled>
                      <Plus size={16} /> Sem permissão
                    </Button>
                  }
                >
                  <Button variant="primary" icon={<Plus size={16} />}>
                    Criar Veículo
                  </Button>
                </PermissionGuard>

                <PermissionGuard 
                  permission={Permission.VEICULOS_EDITAR}
                  fallback={
                    <Button variant="outline" disabled>
                      <Edit size={16} /> Sem permissão
                    </Button>
                  }
                >
                  <Button variant="secondary" icon={<Edit size={16} />}>
                    Editar Veículo
                  </Button>
                </PermissionGuard>

                <PermissionGuard 
                  permission={Permission.VEICULOS_DELETAR}
                  fallback={
                    <Button variant="outline" disabled>
                      <Trash size={16} /> Sem permissão
                    </Button>
                  }
                >
                  <Button variant="danger" icon={<Trash size={16} />}>
                    Deletar Veículo
                  </Button>
                </PermissionGuard>

                <PermissionGuard 
                  adminOnly
                  fallback={
                    <Button variant="outline" disabled>
                      <Settings size={16} /> Apenas Admin
                    </Button>
                  }
                >
                  <Button variant="primary" icon={<Settings size={16} />}>
                    Configurações Admin
                  </Button>
                </PermissionGuard>

                <PermissionGuard 
                  ownerOnly
                  fallback={
                    <Button variant="outline" disabled>
                      Apenas Proprietário
                    </Button>
                  }
                >
                  <Button variant="primary">
                    Ações de Proprietário
                  </Button>
                </PermissionGuard>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Exemplo de verificação programática:</h3>
              <div className="space-y-2">
                <p>
                  Pode criar veículos? {' '}
                  <Badge variant={hasPermission(Permission.VEICULOS_CRIAR) ? 'success' : 'danger'}>
                    {hasPermission(Permission.VEICULOS_CRIAR) ? 'Sim' : 'Não'}
                  </Badge>
                </p>
                <p>
                  Pode deletar veículos? {' '}
                  <Badge variant={hasPermission(Permission.VEICULOS_DELETAR) ? 'success' : 'danger'}>
                    {hasPermission(Permission.VEICULOS_DELETAR) ? 'Sim' : 'Não'}
                  </Badge>
                </p>
                <p>
                  Pode convidar membros? {' '}
                  <Badge variant={hasPermission(Permission.MEMBROS_CONVIDAR) ? 'success' : 'danger'}>
                    {hasPermission(Permission.MEMBROS_CONVIDAR) ? 'Sim' : 'Não'}
                  </Badge>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Todas suas permissões:</h3>
              <div className="flex gap-2 flex-wrap">
                {permissions.map((perm) => (
                  <Badge key={perm} variant="info" size="sm">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
