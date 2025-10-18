📚 EXEMPLOS DE USO DO SISTEMA RBAC
1. Proteção de Página Inteira
// src/app/(app)/configuracoes/page.tsx
'use client';

import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { Permission } from "@/types/rbac";

export default function ConfiguracoesPage() {
  return (
    <PagePermissionGuard 
      permissions={[
        Permission.CONFIG_VISUALIZAR,
        Permission.CONFIG_EDITAR
      ]}
      requireAll={false} // Precisa de pelo menos uma das permissões
    >
      <ConfiguracoesContent />
    </PagePermissionGuard>
  );
}

// OU para admin only:
export default function AdminPage() {
  return (
    <PagePermissionGuard adminOnly>
      <AdminContent />
    </PagePermissionGuard>
  );
}
2. Proteção de Botões
// src/components/vitrine/QuickActions.tsx
import { PermissionButton } from "@/components/PermissionButton";
import { Permission } from "@/types/rbac";

export function QuickActions({ veiculoId }) {
  return (
    <div className="flex gap-2">
      {/* Botão que se desabilita sem permissão */}
      <PermissionButton
        permission={Permission.VITRINE_ADICIONAR}
        variant="primary"
        disabledTooltip="Você não tem permissão para adicionar à vitrine"
        onClick={() => handleAddVitrine(veiculoId)}
      >
        Adicionar à Vitrine
      </PermissionButton>

      {/* Botão que some sem permissão */}
      <PermissionButton
        permission={Permission.ESTOQUE_DELETAR}
        variant="danger"
        hideWhenDenied
        onClick={() => handleDelete(veiculoId)}
      >
        Deletar Veículo
      </PermissionButton>

      {/* Botão que precisa de múltiplas permissões */}
      <PermissionButton
        permissions={[
          Permission.VITRINE_EDITAR_PRECO,
          Permission.VITRINE_ADICIONAR
        ]}
        requireAll={false} // Precisa de pelo menos uma
        onClick={() => handleEditPrice()}
      >
        Editar Preço
      </PermissionButton>
    </div>
  );
}
3. Proteção de Componentes (Renderização Condicional)
// src/components/RenderTables.tsx
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@/types/rbac";

export function VeiculoRow({ veiculo }) {
  return (
    <tr>
      <td>{veiculo.placa}</td>
      <td>{veiculo.modelo}</td>
      <td>
        <div className="flex gap-2">
          {/* Mostra botão editar apenas se tiver permissão */}
          <PermissionGuard permission={Permission.ESTOQUE_EDITAR}>
            <button onClick={() => handleEdit(veiculo.id)}>
              Editar
            </button>
          </PermissionGuard>

          {/* Mostra botão deletar apenas para admin */}
          <PermissionGuard adminOnly>
            <button onClick={() => handleDelete(veiculo.id)}>
              Deletar
            </button>
          </PermissionGuard>

          {/* Oculta seção inteira se não tiver permissões */}
          <PermissionGuard 
            permissions={[
              Permission.FOTOS_UPLOAD,
              Permission.FOTOS_DELETAR
            ]}
            fallback={<span className="text-gray-400">Sem acesso</span>}
          >
            <button onClick={() => handlePhotos(veiculo.id)}>
              Gerenciar Fotos
            </button>
          </PermissionGuard>
        </div>
      </td>
    </tr>
  );
}
4. Verificação Programática (Hook)
// src/components/VeiculoFormModal.tsx
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/types/rbac";

export function VeiculoFormModal({ veiculo }) {
  const { hasPermission, isAdmin, role } = usePermissions();

  const canEdit = hasPermission(Permission.ESTOQUE_EDITAR);
  const canDelete = hasPermission(Permission.ESTOQUE_DELETAR);
  const canUploadPhotos = hasPermission(Permission.FOTOS_UPLOAD);

  const handleSubmit = () => {
    if (!canEdit) {
      alert("Você não tem permissão para editar");
      return;
    }
    // ... lógica de edição
  };

  return (
    <div>
      <h2>Editando Veículo</h2>
      
      {/* Campos desabilitados se não pode editar */}
      <input 
        disabled={!canEdit}
        placeholder="Placa"
      />

      {/* Seção condicional */}
      {canUploadPhotos && (
        <div>
          <h3>Upload de Fotos</h3>
          <input type="file" />
        </div>
      )}

      {/* Botões condicionais */}
      <button onClick={handleSubmit} disabled={!canEdit}>
        Salvar
      </button>

      {canDelete && (
        <button onClick={handleDelete}>
          Deletar
        </button>
      )}

      {/* Mensagem baseada no papel */}
      {!isAdmin() && (
        <p className="text-yellow-600">
          Você tem papel de "{role}". Algumas funções estão restritas.
        </p>
      )}
    </div>
  );
}
5. Proteção de Rotas (Hook com Redirecionamento)
// src/app/(app)/notificacoes/enviar/page.tsx
'use client';

import { useRoutePermission } from "@/hooks/use-route-permission";
import { Permission } from "@/types/rbac";

export default function EnviarNotificacaoPage() {
  const { hasAccess, isLoading } = useRoutePermission({
    permission: Permission.NOTIFICACOES_ENVIAR,
    redirectTo: '/notificacoes',
    autoRedirect: true, // Redireciona automaticamente
  });

  if (isLoading) return <div>Verificando permissões...</div>;
  if (!hasAccess) return null; // Aguarda redirecionamento

  return <EnviarNotificacaoForm />;
}

// OU sem auto-redirect:
export default function ConfigPage() {
  const { hasAccess, redirect } = useRoutePermission({
    permissions: [Permission.CONFIG_EDITAR],
  });

  if (!hasAccess) {
    return (
      <div>
        <p>Você não tem acesso</p>
        <button onClick={redirect}>Voltar</button>
      </div>
    );
  }

  return <ConfigForm />;
}
6. Múltiplas Permissões (Lógica AND/OR)
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@/types/rbac";

// Precisa de TODAS as permissões (AND)
<PermissionGuard
  permissions={[
    Permission.VENDAS_CRIAR,
    Permission.ESTOQUE_VISUALIZAR,
    Permission.DOCUMENTACAO_EDITAR
  ]}
  requireAll={true}
>
  <CriarVendaCompleta />
</PermissionGuard>

// Precisa de PELO MENOS UMA permissão (OR)
<PermissionGuard
  permissions={[
    Permission.CONFIG_EDITAR,
    Permission.CONFIG_MODELOS,
    Permission.CONFIG_CARACTERISTICAS
  ]}
  requireAll={false}
>
  <ConfiguracoesMenu />
</PermissionGuard>
7. Sidebar (Já Implementado)
// src/components/sidebar.tsx - Automático!
// A sidebar filtra itens automaticamente baseado em permissões
// definidas em navigation.config.ts

// navigation.config.ts
export const NAV_ITEMS = [
  {
    href: '/estoque',
    label: 'Estoque',
    icon: Package,
    permissions: [Permission.ESTOQUE_VISUALIZAR],
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: Shield,
    adminOnly: true,
  },
];
🎯 Resumo dos Componentes
Componente	Uso	Quando Usar
<PagePermissionGuard>	Protege página inteira	Sempre no topo da página
<PermissionButton>	Botão com permissão	Ações importantes
<PermissionGuard>	Componente condicional	Seções de UI
usePermissions()	Verificação manual	Lógica complexa
useRoutePermission()	Proteção + redirect	Páginas com redirecionamento
NAV_ITEMS	Menu automático	Sidebar/Menu
Tudo pronto e funcionando! 🚀