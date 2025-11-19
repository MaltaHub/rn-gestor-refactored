'use client';

import React from 'react';
import LineCards from './estoque/line-list';
import { DataItem } from './estoque/line-list/types';
import { Table } from '@/app/framework/table-render';
import { TableColumn } from '@/app/framework/table-render/types';
import FormBuilderShowcase from './forms/FormBuilderShowcase';

export type DemoRow = DataItem & {
    Name: string;
    Age: number;
    Occupation: string;
    Country: string;
};

interface LineCardsDemoProps {
    data: DemoRow[];
}

const LineCardsDemo: React.FC<LineCardsDemoProps> = ({ data }) => {
    const handleDataChange = React.useCallback((newData: DemoRow[]) => {
        console.log('Data changed:', newData);
    }, []);

    const deriveColumns = React.useCallback((rows: DemoRow[]): TableColumn[] => {
        if (!rows.length) {
            return [];
        }
        return Object.keys(rows[0])
            .filter((key) => key !== 'id')
            .map((key, index) => ({
                id: key,
                dataSource: key,
                alias: key,
                dataType: typeof rows[0][key] === 'number' ? 'number' : 'string',
                isDynamic: false,
                order: index,
                isFilterable: true,
                isSortable: true,
            }));
    }, []);

    const createTableFromData = React.useCallback(
        (name: string, rows: DemoRow[], realEscope: boolean) =>
            new Table({
                name,
                realEscope,
                rows,
                columns: deriveColumns(rows),
                allowDynamicColumns: true,
            }),
        [deriveColumns]
    );

    const readOnlyTable = React.useMemo(() => createTableFromData('LineCards - Read Only', data, false), [createTableFromData, data]);
    const editTable = React.useMemo(() => createTableFromData('LineCards - Edit', data, true), [createTableFromData, data]);
    const cellEditTable = React.useMemo(() => createTableFromData('LineCards - Cell Edit', data, true), [createTableFromData, data]);

    return (
        <div className="flex w-full flex-col gap-16 px-16 py-32">
            <main className="flex w-full flex-col items-start gap-16">
                <section className="w-full max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Modo Visualização (Read-Only)</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Usuários podem visualizar dados, navegar e filtrar, mas não podem editar ou deletar.
                </p>
                <LineCards table={readOnlyTable} navigateTo={{ path: '/profile', keyPath: 'id' }} mode="read-only" />
            </section>

                <section className="w-full max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Modo Edição (Edit)</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Modo completo: adicionar/remover colunas, filtrar, ordenar, editar e deletar linhas.
                </p>
                <LineCards
                    table={editTable}
                    navigateTo={{ path: '/profile', keyPath: 'id' }}
                    mode="edit"
                    onDataChange={handleDataChange}
                />
                </section>

                <section className="w-full max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Modo Edição de Células</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Permite editar, adicionar ou remover linhas, mas mantém a estrutura de colunas travada.
                </p>
                <LineCards
                    table={cellEditTable}
                    navigateTo={{ path: '/profile', keyPath: 'id' }}
                    mode="cell-edit"
                    onDataChange={handleDataChange}
                />
                </section>
            </main>
            <FormBuilderShowcase />
        </div>
    );
};

export default LineCardsDemo;
