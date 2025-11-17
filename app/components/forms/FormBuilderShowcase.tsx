'use client';

import React from 'react';
import { FormBuilder, FormSchema, createFormTag } from '@/app/framework/form-builder';

const minimalProfileSchema: FormSchema = {
    key: 'profile-minimal',
    title: 'Formulário Minimalista',
    description: 'Fluxo rápido para cadastros simples, ideal para operações em massa.',
    mode: 'minimal',
    sections: [
        {
            key: 'identity',
            orientation: 'vertical',
            fields: [
                {
                    key: 'fullName',
                    label: 'Nome Completo',
                    placeholder: 'Ex.: Maria Costa',
                    type: 'text',
                    validations: [{ type: 'required', message: 'Informe o nome' }],
                },
                {
                    key: 'email',
                    label: 'E-mail Corporativo',
                    placeholder: 'nome@empresa.com',
                    type: 'text',
                    validations: [
                        { type: 'required', message: 'Informe o e-mail' },
                        {
                            type: 'pattern',
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'E-mail inválido',
                        },
                    ],
                },
                {
                    key: 'role',
                    label: 'Cargo',
                    placeholder: 'Selecione o cargo',
                    type: 'select',
                    options: [
                        { label: 'Analista', value: 'analyst' },
                        { label: 'Supervisor', value: 'supervisor' },
                        { label: 'Gestor', value: 'manager' },
                    ],
                    validations: [{ type: 'required', message: 'Selecione um cargo' }],
                },
            ],
        },
    ],
    actions: [
        { key: 'cancel', label: 'Cancelar', intent: 'secondary', type: 'reset' },
        { key: 'save', label: 'Salvar', intent: 'primary', type: 'submit' },
    ],
};

const advancedInventorySchema: FormSchema = {
    key: 'inventory-advanced',
    title: 'Builder Avançado',
    description: 'Demonstração de fluxos robustos com validações e ações customizadas.',
    mode: 'advanced',
    sections: [
        {
            key: 'meta',
            title: 'Detalhes da Linha',
            orientation: 'grid',
            fields: [
                {
                    key: 'product',
                    label: 'Produto',
                    placeholder: 'Ex.: Cabo Cat6',
                    type: 'text',
                    validations: [{ type: 'required' }],
                },
                {
                    key: 'sku',
                    label: 'SKU',
                    placeholder: 'SKU interno',
                    type: 'text',
                    validations: [{ type: 'required' }],
                },
                {
                    key: 'quantity',
                    label: 'Quantidade',
                    type: 'number',
                    defaultValue: 10,
                    validations: [
                        { type: 'required' },
                        { type: 'min', value: 1 },
                        { type: 'max', value: 5000 },
                    ],
                },
                {
                    key: 'unitPrice',
                    label: 'Preço Unitário',
                    type: 'currency',
                    defaultValue: 39.9,
                    validations: [{ type: 'required' }, { type: 'min', value: 1 }],
                },
                {
                    key: 'discount',
                    label: 'Desconto',
                    type: 'percent',
                    defaultValue: 0,
                    validations: [{ type: 'min', value: 0 }, { type: 'max', value: 80 }],
                },
            ],
        },
        {
            key: 'controls',
            title: 'Controles Inteligentes',
            orientation: 'vertical',
            fields: [
                {
                    key: 'hasSerialControl',
                    label: 'Controlar por Serial?',
                    description: 'Ative para forçar registro individual.',
                    type: 'switch',
                },
                {
                    key: 'notes',
                    label: 'Observações',
                    placeholder: 'Detalhes adicionais, formatos aceitos, SLA etc.',
                    type: 'textarea',
                    layout: { width: 'full' },
                    validations: [{ type: 'max', value: 280 }],
                },
            ],
        },
    ],
    actions: [
        { key: 'cancel', label: 'Descartar', intent: 'secondary', type: 'reset' },
        {
            key: 'archive',
            label: 'Arquivar',
            intent: 'danger',
            type: 'custom',
            onTrigger: async () => {
                console.info('Arquivando linha...');
            },
        },
        { key: 'save', label: 'Salvar Alterações', intent: 'primary', type: 'submit' },
    ],
};

const MinimalProfileFormTag = createFormTag(minimalProfileSchema);

const FormBuilderShowcase: React.FC = () => {
    const [resultLog, setResultLog] = React.useState<string>('Nenhuma interação registrada.');

    return (
        <section className="flex w-full flex-col gap-10 rounded-2xl border border-slate-200 bg-white/70 p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Framework de Forms</h2>
                <p className="text-base text-slate-600 dark:text-slate-300">
                    A nova linguagem declarativa permite alternar entre fluxos minimalistas e avançados apenas trocando o schema.
                </p>
            </header>

            <div className="grid gap-10 lg:grid-cols-2">
                <div className="flex flex-col gap-6 rounded-2xl bg-slate-50/60 p-6 shadow-inner dark:bg-slate-900/40">
                    <p className="text-sm uppercase tracking-wide text-slate-500">Modo rápido</p>
                    <MinimalProfileFormTag
                        initialValues={{ fullName: 'Maria Costa', role: 'manager' }}
                        onSubmit={(state) => setResultLog(`Perfil salvo (${new Date().toLocaleTimeString()}): ${JSON.stringify(state.values)}`)}
                    />
                </div>

                <div className="flex flex-col gap-6 rounded-2xl bg-slate-50/60 p-6 shadow-inner dark:bg-slate-900/40">
                    <p className="text-sm uppercase tracking-wide text-slate-500">Modo avançado</p>
                    <FormBuilder
                        schema={advancedInventorySchema}
                        initialValues={{ product: 'Cabo Cat6', sku: 'CAB-00092' }}
                        onSubmit={(state) => setResultLog(`Inventário salvo (${state.values.sku}): ${state.values.quantity} itens`)}
                        onCancel={() => setResultLog('Alterações descartadas')}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                {resultLog}
            </div>
        </section>
    );
};

export default FormBuilderShowcase;
