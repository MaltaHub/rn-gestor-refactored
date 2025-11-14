'use client';

import React from 'react';
import LineCards from './estoque/line-list';
import { DataItem } from './estoque/line-list/types';

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

    return (
        <main className="flex w-full flex-col items-start gap-16 px-16 py-32">
            <section className="w-full max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Modo Visualização (Read-Only)</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Usuários podem visualizar dados, navegar e filtrar, mas não podem editar ou deletar.
                </p>
                <LineCards data={data} navigateTo={{ path: '/profile', keyPath: 'id' }} mode="read-only" />
            </section>

            <section className="w-full max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Modo Edição (Edit)</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Modo completo: adicionar/remover colunas, filtrar, ordenar, editar e deletar linhas.
                </p>
                <LineCards
                    data={data}
                    navigateTo={{ path: '/profile', keyPath: 'id' }}
                    mode="edit"
                    onDataChange={handleDataChange}
                />
            </section>
        </main>
    );
};

export default LineCardsDemo;
