# Mapa da fronteira backend ↔ frontend

Operações agrupadas por domínio. Cada item referencia a fonte no banco (tabela/view/RPC/Auth) e os arquivos do frontend que consomem a operação via camada `backend/modules/*`.

## dashboard
- `dashboard.getMetrics` → view `dashboard_metricas` → `app/app/page.tsx`
- `dashboard.getChecklist` → view `dashboard_checklist` → `app/app/page.tsx`
- `dashboard.getRecentVehicles` → tabela `veiculos` (join com `modelos`) → `app/app/page.tsx`

## estoque
- `estoque.listVehicles` → tabela `veiculos` (join `modelos`, `veiculos_loja`, `lojas`) → `app/app/estoque/page.tsx`, `app/app/page.tsx`
- `estoque.getVehicleByPlate` → tabela `veiculos` → `app/app/estoque/page.tsx`
- `estoque.saveVehicle` → RPC `rpc_gerenciar_veiculos` → `app/app/estoque/page.tsx`, `app/app/page.tsx`
- `estoque.updateVehicleStatus` → RPC `rpc_gerenciar_veiculos` → `app/app/estoque/page.tsx`

## anúncios
- `anuncios.listPlatformStatus` → tabela `plataformas` (join com `anuncios`) → `app/app/anuncios/page.tsx`
- `anuncios.updatePlatform` → RPC `rpc_gerenciar_plataformas` → `app/app/anuncios/page.tsx`

## vendas
- `vendas.getPipelineSnapshot` → tabela `vendas` (agrupamento por `status_venda`) → `app/app/vendas/page.tsx`
- `vendas.listOpenSales` → tabela `vendas` → `app/app/vendas/page.tsx`
- `vendas.createSale` → RPC `rpc_registrar_venda` → `app/app/vendas/page.tsx`
- `vendas.advanceSaleStage` → RPC `rpc_mudar_status_venda` → `app/app/vendas/page.tsx`

## promoções
- `promocoes.listPromotions` → tabela `promocoes` → `app/app/promocoes/page.tsx`
- `promocoes.togglePromotion` → RPC `rpc_gerenciar_promocoes` → `app/app/promocoes/page.tsx`
- `promocoes.createPromotion` → RPC `rpc_criar_promocao` → `app/app/promocoes/page.tsx`
- `promocoes.schedulePromotion` → RPC `rpc_agendar_promocao` → `app/app/promocoes/page.tsx`

## perfil
- `perfil.getProfile` → view `usuarios_perfis` → `app/app/perfil/page.tsx`
- `perfil.updateProfile` → RPC `rpc_atualizar_perfil` → `app/app/perfil/page.tsx`
- `perfil.getPreferences` → view `usuarios_preferencias` → `app/app/perfil/page.tsx`
- `perfil.updatePreferences` → RPC `rpc_atualizar_preferencias` → `app/app/perfil/page.tsx`
- `perfil.requestPasswordReset` → Auth `supabase.auth.resetPasswordForEmail` → `app/app/perfil/page.tsx`
- `perfil.configureMfa` → RPC `rpc_configurar_mfa` → `app/app/perfil/page.tsx`

## configurações
- `configuracoes.listStores` → RPC `rpc_gerenciar_lojas` (listar) → `app/app/configuracoes/page.tsx`
- `configuracoes.createStore` → RPC `rpc_gerenciar_lojas` (criar) → `app/app/configuracoes/page.tsx`
- `configuracoes.updateStore` → RPC `rpc_gerenciar_lojas` (atualizar) → `app/app/configuracoes/page.tsx`
- `configuracoes.deleteStore` → RPC `rpc_gerenciar_lojas` (apagar) → `app/app/configuracoes/page.tsx`
- `configuracoes.listCharacteristics` → RPC `rpc_gerenciar_caracteristicas` (listar) → `app/app/configuracoes/page.tsx`
- `configuracoes.createCharacteristic` → RPC `rpc_gerenciar_caracteristicas` (criar) → `app/app/configuracoes/page.tsx`
- `configuracoes.updateCharacteristic` → RPC `rpc_gerenciar_caracteristicas` (atualizar) → `app/app/configuracoes/page.tsx`
- `configuracoes.deleteCharacteristic` → RPC `rpc_gerenciar_caracteristicas` (apagar) → `app/app/configuracoes/page.tsx`
- `configuracoes.listPlatforms` → RPC `rpc_gerenciar_plataformas` (listar) → `app/app/configuracoes/page.tsx`
- `configuracoes.createPlatform` → RPC `rpc_gerenciar_plataformas` (criar) → `app/app/configuracoes/page.tsx`
- `configuracoes.updatePlatform` → RPC `rpc_gerenciar_plataformas` (atualizar) → `app/app/configuracoes/page.tsx`
- `configuracoes.deletePlatform` → RPC `rpc_gerenciar_plataformas` (apagar) → `app/app/configuracoes/page.tsx`
- `configuracoes.listLocations` → RPC `rpc_gerenciar_locais` (listar) → `app/app/configuracoes/page.tsx`
- `configuracoes.createLocation` → RPC `rpc_gerenciar_locais` (criar) → `app/app/configuracoes/page.tsx`
- `configuracoes.updateLocation` → RPC `rpc_gerenciar_locais` (atualizar) → `app/app/configuracoes/page.tsx`
- `configuracoes.deleteLocation` → RPC `rpc_gerenciar_locais` (apagar) → `app/app/configuracoes/page.tsx`
- `configuracoes.listModels` → RPC `rpc_gerenciar_modelos` (listar) → `app/app/configuracoes/page.tsx`
- `configuracoes.createModel` → RPC `rpc_gerenciar_modelos` (criar) → `app/app/configuracoes/page.tsx`
- `configuracoes.updateModel` → RPC `rpc_gerenciar_modelos` (atualizar) → `app/app/configuracoes/page.tsx`
- `configuracoes.deleteModel` → RPC `rpc_gerenciar_modelos` (apagar) → `app/app/configuracoes/page.tsx`

## auth
- `auth.signInWithPassword` → Auth `supabase.auth.signInWithPassword` → `app/(site)/login/page.tsx`
- `auth.signOut` → Auth `supabase.auth.signOut` → `components/navigation/app-shell.tsx`

> Observação: algumas RPCs (`rpc_registrar_venda`, `rpc_criar_promocao`, etc.) precisam ser implementadas seguindo o padrão dos helpers existentes (`rpc_gerenciar_*`).
