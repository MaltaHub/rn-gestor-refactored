'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Plus } from 'lucide-react';

import { useVeiculosUI, type VeiculoUI } from '@/adapters/adaptador-estoque';
import { useLocais } from '@/hooks/use-configuracoes';
import { ESTADOS_VENDA as ESTADOS_VENDA_CONFIG, SPECIAL_VALUES } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RenderTables, type Column } from '@/components/RenderTables';
import { useEstoqueStore } from '@/stores/useEstoqueStore';

const ESTADOS_VENDA: VeiculoUI['estado_venda'][] = ESTADOS_VENDA_CONFIG as VeiculoUI['estado_venda'][];
const SEM_LOCAL_VALUE = SPECIAL_VALUES.SEM_LOCAL;

const formatEstadoLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeText = (value: string | null | undefined) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function EstoquePage() {
  const { data: veiculos = [], isLoading } = useVeiculosUI();
  const { data: todosLocais = [] } = useLocais();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { filters, setFilters, resetFilters } = useEstoqueStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const estadoFiltroParam = searchParams.get('estado');
  const estadoFiltro =
    estadoFiltroParam && ESTADOS_VENDA.includes(estadoFiltroParam as VeiculoUI['estado_venda'])
      ? (estadoFiltroParam as VeiculoUI['estado_venda'])
      : filters.estadoVendaSelecionado === 'todos'
      ? null
      : filters.estadoVendaSelecionado;

  const contagemPorEstado = useMemo(() => {
    const counts = ESTADOS_VENDA.reduce<Record<string, number>>((acc, estado) => {
      acc[estado] = 0;
      return acc;
    }, {});

    veiculos.forEach((veiculo) => {
      const estado = veiculo.estado_venda;
      if (estado && counts[estado] !== undefined) {
        counts[estado] += 1;
      }
    });

    return counts;
  }, [veiculos]);

  const localOptionsData = useMemo(() => {
    const showroom: { value: string; label: string }[] = [];
    const fora: { value: string; label: string }[] = [];
    const todos: { value: string; label: string }[] = [];

    const orderByLabel = (list: { value: string; label: string }[]) =>
      [...list].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));

    todosLocais.forEach((local) => {
      if (!local?.id || !local.nome) return;
      const option = { value: local.id, label: local.nome };
      todos.push(option);
      if (local.loja_id) {
        showroom.push(option);
      } else {
        fora.push(option);
      }
    });

    const sortedShowroom = orderByLabel(showroom);
    let sortedFora = orderByLabel(fora);
    let sortedTodos = orderByLabel(todos);

    const hasVeiculoSemLocal = veiculos.some((item) => !item.local?.id);
    if (hasVeiculoSemLocal) {
      const semLocalOption = { value: SEM_LOCAL_VALUE, label: 'Sem local vinculado' };
      sortedFora = [...sortedFora, semLocalOption];
      sortedTodos = [...sortedTodos, semLocalOption];
    }

    return {
      options: { todos: sortedTodos, showroom: sortedShowroom, fora: sortedFora },
    };
  }, [todosLocais, veiculos]);

  const uniqueModelos = useMemo(() => {
    const set = new Set<string>();
    veiculos.forEach((veiculo) => {
      const modelo = veiculo.modeloCompleto;
      if (modelo) set.add(modelo);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [veiculos]);

  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((veiculo) => {
      if (estadoFiltro && veiculo.estado_venda !== estadoFiltro) return false;

      if (filters.localIdFiltro) {
        if (filters.localIdFiltro === SEM_LOCAL_VALUE) {
          if (veiculo.local?.id) return false;
        } else if (veiculo.local?.id !== filters.localIdFiltro) {
          return false;
        }
      }

      if (filters.modelosFiltro.length > 0 && !filters.modelosFiltro.includes(veiculo.modeloCompleto || '')) {
        return false;
      }

      if (filters.termo) {
        const normalizedTerm = normalizeText(filters.termo);
        const campos = [
          veiculo.veiculoDisplay,
          veiculo.modeloCompleto,
          veiculo.placa,
          veiculo.localDisplay,
          veiculo.estadoVendaLabel,
          veiculo.cor,
        ];
        const matches = campos.some((campo) => normalizeText(campo).includes(normalizedTerm));
        if (!matches) return false;
      }

      return true;
    });
  }, [estadoFiltro, filters.localIdFiltro, filters.modelosFiltro, filters.termo, veiculos]);

  const temFiltrosAtivos = useMemo(() => {
    return (
      filters.termo.trim() !== '' ||
      filters.localIdFiltro !== '' ||
      filters.modelosFiltro.length > 0
    );
  }, [filters]);

  const totalVeiculos = veiculos.length;
  const totalFiltrados = veiculosFiltrados.length;

  const handleLimparFiltros = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const columns: Column<VeiculoUI>[] = useMemo(
    () => [
      {
        key: 'veiculoDisplay',
        label: 'Veículo',
        width: 300,
        minWidth: 200,
        sortable: true,
        render: (value) => <span className="font-medium">{value}</span>,
      },
      {
        key: 'placa',
        label: 'Placa',
        width: 120,
        minWidth: 100,
        sortable: true,
      },
      {
        key: 'anoPrincipal',
        label: 'Ano',
        width: 100,
        minWidth: 80,
        sortable: true,
        render: (value) => value ?? '—',
      },
      {
        key: 'hodometroFormatado',
        label: 'Hodômetro',
        width: 130,
        minWidth: 110,
        sortable: true,
        accessor: (row) => row.hodometro,
        render: (value, row) => row.hodometroFormatado ?? '—',
      },
      {
        key: 'estadoVendaLabel',
        label: 'Estado venda',
        width: 140,
        minWidth: 120,
        sortable: true,
      },
      {
        key: 'estadoVeiculoLabel',
        label: 'Estado veículo',
        width: 140,
        minWidth: 120,
        sortable: true,
      },
      {
        key: 'localDisplay',
        label: 'Local',
        width: 180,
        minWidth: 150,
        sortable: true,
      },
      {
        key: 'precoFormatado',
        label: 'Preço',
        width: 130,
        minWidth: 110,
        sortable: true,
        align: 'right',
        accessor: (row) => row.preco_venal,
        render: (value, row) => row.precoFormatado ?? '—',
      },
      {
        key: 'estagio_documentacao',
        label: 'Documentação',
        width: 150,
        minWidth: 130,
        sortable: true,
        render: (value) => value ?? 'Sem informação',
      },
      {
        key: 'cor',
        label: 'Cor',
        width: 120,
        minWidth: 100,
        sortable: true,
        render: (value) => value ?? '—',
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-6 flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Carregando estoque...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Estoque de Veículos</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Visualize, edite e cadastre veículos disponíveis nas lojas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="neutral" size="lg">
              {totalVeiculos} de {totalVeiculos} veículos
            </Badge>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              asChild
            >
              <Link href="/criar">Cadastrar veículo</Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {ESTADOS_VENDA.map((estado) => (
            <Link key={estado} href={`/estoque?estado=${estado}`} scroll={false}>
              <Badge
                variant={estadoFiltro === estado ? 'primary' : 'outline'}
                className="cursor-pointer hover:ring-2 hover:ring-[var(--purple-magic)]/20 transition-all"
              >
                {formatEstadoLabel(estado)} <span className="ml-1">({contagemPorEstado[estado] || 0})</span>
              </Badge>
            </Link>
          ))}
          <Link href="/estoque" scroll={false}>
            <Badge
              variant={!estadoFiltro ? 'primary' : 'outline'}
              className="cursor-pointer hover:ring-2 hover:ring-[var(--purple-magic)]/20 transition-all"
            >
              Todos
            </Badge>
          </Link>
        </div>

        {searchOpen && (
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Buscar por veículo, placa, modelo..."
                value={filters.termo}
                onChange={(e) => setFilters({ termo: e.target.value })}
              />

              <select
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={filters.localIdFiltro}
                onChange={(e) => setFilters({ localIdFiltro: e.target.value })}
              >
                <option value="">Todos os locais</option>
                {localOptionsData.options.todos.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={filters.modelosFiltro[0] || ''}
                onChange={(e) =>
                  setFilters({ modelosFiltro: e.target.value ? [e.target.value] : [] })
                }
              >
                <option value="">Todos os modelos</option>
                {uniqueModelos.map((modelo) => (
                  <option key={modelo} value={modelo}>
                    {modelo}
                  </option>
                ))}
              </select>
            </div>

            {temFiltrosAtivos && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="warning"
                  leftIcon={<Search className="w-3 h-3" />}
                >
                  {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''} encontrado{totalFiltrados !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={handleLimparFiltros}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant={searchOpen ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Search className="w-4 h-4" />}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? 'Ocultar busca' : 'Mostrar busca'}
          </Button>
        </div>

        <RenderTables
          data={veiculosFiltrados}
          columns={columns}
          mode="view"
          rowKey="id"
          onRowClick={(row) => router.push(`/estoque/${row.id}`)}
          enableVirtualization={true}
          itemsPerPage={15}
          className="mt-6"
        />
      </div>
    </div>
  );
}
