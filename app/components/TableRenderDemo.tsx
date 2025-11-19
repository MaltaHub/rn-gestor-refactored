'use client';

import React, { useState, useEffect } from 'react';
import { Table, tableRegistry, useTable } from '@/app/framework/table-render';
import { TableConfig, TableColumn, TableRow } from '@/app/framework/table-render/types';

/**
 * Demonstração do Table Render
 * Mostra criação e manipulação de tabelas reais e imaginárias
 */
export function TableRenderDemo() {
  const [output, setOutput] = useState<string[]>([]);
  const [productsTable, setProductsTable] = useState<Table | null>(null);
  const [pricesTable, setPricesTable] = useState<Table | null>(null);
  const [statisticsTable, setStatisticsTable] = useState<Table | null>(null);

  const addLog = (message: string) => {
    setOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Inicializar tabelas no mount
  useEffect(() => {
    try {
      addLog('Iniciando Table Render Demo...');

      // ===== 1. TABELA REAL: Produtos =====
      const columnsProducts: TableColumn[] = [
        {
          id: 'id',
          dataSource: 'id',
          dataType: 'string',
          isDynamic: false,
          alias: 'ID do Produto',
          order: 1,
          isFilterable: true,
          isSortable: true,
          width: '100px',
        },
        {
          id: 'name',
          dataSource: 'name',
          dataType: 'string',
          isDynamic: false,
          alias: 'Nome',
          order: 2,
          isFilterable: true,
          isSortable: true,
          width: '200px',
        },
        {
          id: 'category',
          dataSource: 'category',
          dataType: 'string',
          isDynamic: false,
          alias: 'Categoria',
          order: 3,
          isFilterable: true,
          isSortable: true,
        },
        {
          id: 'stock',
          dataSource: 'stock',
          dataType: 'number',
          isDynamic: false,
          alias: 'Estoque',
          order: 4,
          isFilterable: true,
          isSortable: true,
        },
      ];

      const rowsProducts: TableRow[] = [
        { id: 'prod_001', name: 'Notebook Dell', category: 'Eletrônicos', stock: 5 },
        { id: 'prod_002', name: 'Mouse Logitech', category: 'Periféricos', stock: 25 },
        { id: 'prod_003', name: 'Teclado Mecânico', category: 'Periféricos', stock: 15 },
        { id: 'prod_004', name: 'Monitor LG 27"', category: 'Monitores', stock: 8 },
      ];

      const productsConfig: TableConfig = {
        id: 'products_real',
        name: 'Produtos',
        description: 'Tabela real de produtos com operações CRUD',
        realEscope: true,
        rows: rowsProducts,
        columns: columnsProducts,
        trackHistory: true,
        allowDynamicColumns: true,
        callbacks: {
          onCreate: async (row) => {
            addLog(`✓ Callback CREATE chamado para: ${row.id}`);
          },
          onUpdate: async (rowId, changes) => {
            addLog(`✓ Callback UPDATE chamado para: ${rowId}`);
          },
          onDelete: async (rowId) => {
            addLog(`✓ Callback DELETE chamado para: ${rowId}`);
          },
        },
      };

      const products = new Table(productsConfig);
      tableRegistry.register(products, 'products_real');
      setProductsTable(products);
      addLog('✓ Tabela REAL criada: "Produtos" (realEscope: true)');

      // ===== 2. TABELA REAL: Preços =====
      const columnsPrices: TableColumn[] = [
        {
          id: 'id',
          dataSource: 'id',
          dataType: 'string',
          isDynamic: false,
          alias: 'ID',
          order: 1,
        },
        {
          id: 'product_id',
          dataSource: 'product_id',
          dataType: 'string',
          isDynamic: false,
          alias: 'Produto',
          order: 2,
        },
        {
          id: 'preco_minimo',
          dataSource: 'preco_minimo',
          dataType: 'currency',
          isDynamic: false,
          alias: 'Preço Mínimo',
          order: 3,
        },
        {
          id: 'preco_venda',
          dataSource: 'preco_venda',
          dataType: 'currency',
          isDynamic: false,
          alias: 'Preço Venda',
          order: 4,
        },
      ];

      const rowsPrices: TableRow[] = [
        { id: 'price_001', product_id: 'prod_001', preco_minimo: 2500, preco_venda: 3500 },
        { id: 'price_002', product_id: 'prod_002', preco_minimo: 50, preco_venda: 120 },
        { id: 'price_003', product_id: 'prod_003', preco_minimo: 150, preco_venda: 350 },
        { id: 'price_004', product_id: 'prod_004', preco_minimo: 800, preco_venda: 1200 },
      ];

      const pricesConfig: TableConfig = {
        id: 'prices_real',
        name: 'Preços',
        description: 'Tabela real de preços por produto',
        realEscope: true,
        rows: rowsPrices,
        columns: columnsPrices,
        trackHistory: true,
        allowDynamicColumns: true,
      };

      const prices = new Table(pricesConfig);
      tableRegistry.register(prices, 'prices_real');
      setPricesTable(prices);
      addLog('✓ Tabela REAL criada: "Preços" (realEscope: true)');

      // ===== 3. TABELA IMAGINÁRIA: Estatísticas =====
      const columnsStats: TableColumn[] = [
        {
          id: 'id',
          dataSource: 'id',
          dataType: 'string',
          isDynamic: false,
          alias: 'ID',
          order: 1,
        },
        {
          id: 'product_name',
          dataSource: 'product_name',
          dataType: 'string',
          isDynamic: false,
          alias: 'Produto',
          order: 2,
        },
        {
          id: 'estoque_atual',
          dataSource: 'estoque_atual',
          dataType: 'number',
          isDynamic: false,
          alias: 'Estoque Atual',
          order: 3,
        },
        // Coluna dinâmica: lookup do preço mínimo
        {
          id: 'preco_minimo_lookup',
          dataSource: 'preco_minimo_lookup',
          dataType: 'currency',
          isDynamic: true,
          alias: '📊 Preço Mínimo',
          order: 4,
          isReadOnly: true,
          expression: 'id == "prod_001" ? 2500 : (id == "prod_002" ? 50 : (id == "prod_003" ? 150 : 800))',
        },
        // Coluna dinâmica: cálculo de valor total em estoque
        {
          id: 'valor_total_estoque',
          dataSource: 'valor_total_estoque',
          dataType: 'currency',
          isDynamic: true,
          alias: '📊 Valor Total Estoque',
          order: 5,
          isReadOnly: true,
          expression: 'estoque_atual * preco_minimo_lookup',
        },
      ];

      const rowsStats: TableRow[] = [
        { id: 'prod_001', product_name: 'Notebook Dell', estoque_atual: 5 },
        { id: 'prod_002', product_name: 'Mouse Logitech', estoque_atual: 25 },
        { id: 'prod_003', product_name: 'Teclado Mecânico', estoque_atual: 15 },
        { id: 'prod_004', product_name: 'Monitor LG 27"', estoque_atual: 8 },
      ];

      const statsConfig: TableConfig = {
        id: 'statistics_imaginary',
        name: 'Estatísticas',
        description: 'Tabela imaginária com colunas dinâmicas para análise',
        realEscope: false, // NÃO permite CRUD
        rows: rowsStats,
        columns: columnsStats,
        trackHistory: false,
        allowDynamicColumns: true,
      };

      const statistics = new Table(statsConfig);
      tableRegistry.register(statistics, 'statistics_imaginary');
      setStatisticsTable(statistics);
      addLog('✓ Tabela IMAGINÁRIA criada: "Estatísticas" (realEscope: false)');

      // Log do registry
      const stats = tableRegistry.getStats();
      addLog(`📦 Registry de Tabelas: ${stats.totalTables} tabelas (${stats.realTables} reais, ${stats.imaginaryTables} imaginárias)`);
    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // Demonstrar CRUD em tabela real
  const demonstrateCRUD = async () => {
    if (!productsTable) return;

    try {
      addLog('🔄 Iniciando demonstração de CRUD em tabela real...');

      // CREATE
      const newRowId = await productsTable.create({
        name: 'Webcam HD',
        category: 'Periféricos',
        stock: 10,
      });
      addLog(`✓ CREATE: Novo produto criado com ID ${newRowId}`);

      // UPDATE
      await productsTable.update(newRowId, { stock: 20 });
      addLog(`✓ UPDATE: Estoque do produto ${newRowId} atualizado para 20`);

      // READ
      const rows = productsTable.getRows();
      addLog(`✓ READ: Tabela agora tem ${rows.length} produtos`);

      // DELETE (comentado para manter dados de demonstração)
      // await productsTable.delete(newRowId);
      // addLog(`✓ DELETE: Produto ${newRowId} deletado`);
    } catch (error) {
      addLog(`❌ Erro em CRUD: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Tentar operações em tabela imaginária (deve falhar)
  const demonstrateImaginaryError = async () => {
    if (!statisticsTable) return;

    try {
      addLog('🔄 Tentando CREATE em tabela imaginária (deve falhar)...');
      await statisticsTable.create({ id: 'test', product_name: 'Test' });
      addLog('❌ Erro: Operação não deveria ter sucedido!');
    } catch (error) {
      addLog(`✓ Erro esperado: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Demonstrar colunas dinâmicas
  const demonstrateDynamicColumns = async () => {
    if (!statisticsTable) return;

    try {
      addLog('🔄 Adicionando coluna dinâmica a tabela imaginária...');

      const newDynamicColumn: TableColumn = {
        id: 'margem_lucro',
        dataSource: 'margem_lucro',
        dataType: 'number',
        isDynamic: true,
        alias: '📊 Margem de Lucro (%)',
        order: 6,
        isReadOnly: true,
        expression: '((preco_venda - preco_minimo_lookup) / preco_minimo_lookup) * 100',
      };

      await statisticsTable.addDynamicColumn(newDynamicColumn);
      addLog(`✓ Coluna dinâmica adicionada: "${newDynamicColumn.alias}"`);

      // Computar valores
      statisticsTable.computeDynamicColumns();
      addLog('✓ Colunas dinâmicas computadas');
    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Demonstrar snapshots
  const demonstrateSnapshot = () => {
    if (!productsTable) return;

    try {
      addLog('🔄 Criando snapshot da tabela real...');
      const snapshot = productsTable.createSnapshot();
      addLog(`✓ Snapshot criado: ${snapshot.rows.length} linhas, hash: ${snapshot.contentHash}`);
    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">📊 Table Render Demo</h1>

      {/* Controles */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={demonstrateCRUD}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Demonstrar CRUD (Real)
        </button>
        <button
          onClick={demonstrateImaginaryError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Tentar CRUD (Imaginária)
        </button>
        <button
          onClick={demonstrateDynamicColumns}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Adicionar Coluna Dinâmica
        </button>
        <button
          onClick={demonstrateSnapshot}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Criar Snapshot
        </button>
      </div>

      {/* Resumo de Tabelas */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-bold">Tabela Real: Produtos</h3>
          <p className="text-sm">
            {productsTable
              ? `${productsTable.getRows().length} linhas, ${productsTable.getColumns().length} colunas`
              : 'Carregando...'}
          </p>
        </div>
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-bold">Tabela Real: Preços</h3>
          <p className="text-sm">
            {pricesTable
              ? `${pricesTable.getRows().length} linhas, ${pricesTable.getColumns().length} colunas`
              : 'Carregando...'}
          </p>
        </div>
        <div className="p-4 bg-yellow-100 rounded">
          <h3 className="font-bold">Tabela Imaginária: Estatísticas</h3>
          <p className="text-sm">
            {statisticsTable
              ? `${statisticsTable.getRows().length} linhas, ${statisticsTable.getColumns().length} colunas`
              : 'Carregando...'}
          </p>
        </div>
      </div>

      {/* Log */}
      <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        {output.map((line, i) => (
          <div key={i} className="py-1">
            {line}
          </div>
        ))}
      </div>

      {/* Tabelas em JSON */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold mb-2">Tabela Real (Produtos)</h3>
          <div className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            <pre>{JSON.stringify(productsTable?.getRows(), null, 2)}</pre>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2">Tabela Imaginária (Estatísticas - Colunas)</h3>
          <div className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            <pre>{JSON.stringify(statisticsTable?.getColumns(), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
