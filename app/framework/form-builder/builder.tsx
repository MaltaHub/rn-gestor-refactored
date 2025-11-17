'use client';

import React from 'react';
import { FieldRegistry, defaultRegistry } from './registry';
import {
    FormActionDefinition,
    FormFieldDefinition,
    FormRuntimeContext,
    FormRuntimeState,
    FormSchema,
    FormSectionDefinition,
} from './schema';
import { runFieldValidations } from './validation';

export interface FormBuilderProps {
    schema: FormSchema;
    initialValues?: Record<string, unknown>;
    registry?: FieldRegistry;
    onSubmit?: (state: FormRuntimeState) => Promise<void> | void;
    onCancel?: () => void;
    onChange?: (state: FormRuntimeState) => void;
    className?: string;
    readOnly?: boolean;
    renderHeader?: (schema: FormSchema) => React.ReactNode;
}

function resolveInitialValues(schema: FormSchema, initialValues?: Record<string, unknown>) {
    const result: Record<string, unknown> = { ...initialValues };
    schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
            if (result[field.key] === undefined) {
                result[field.key] = field.defaultValue ?? '';
            }
        });
    });
    return result;
}

function useDefinitionMap(schema: FormSchema) {
    return React.useMemo(() => {
        const map = new Map<string, FormFieldDefinition>();
        schema.sections.forEach((section) => {
            section.fields.forEach((field) => {
                map.set(field.key, field);
            });
        });
        return map;
    }, [schema]);
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
    schema,
    initialValues,
    registry = defaultRegistry,
    onSubmit,
    onCancel,
    onChange,
    className,
    readOnly,
    renderHeader,
}) => {
    const definitionMap = useDefinitionMap(schema);

    const [state, setState] = React.useState<FormRuntimeState>(() => ({
        values: resolveInitialValues(schema, initialValues),
        errors: {},
        touched: {},
        dirty: false,
    }));

    const notifyChange = React.useCallback(
        (nextState: FormRuntimeState) => {
            if (onChange) {
                onChange(nextState);
            }
        },
        [onChange]
    );

    const updateState = React.useCallback(
        (updater: (prev: FormRuntimeState) => FormRuntimeState) => {
            setState((prev) => {
                const next = updater(prev);
                notifyChange(next);
                return next;
            });
        },
        [notifyChange]
    );

    const runtimeContext = React.useMemo<FormRuntimeContext>(() => {
        const context: FormRuntimeContext = {
            schema,
            updateValue: () => undefined,
            runValidation: async () => true,
            submit: async () => undefined,
        };

        context.updateValue = (key: string, value: unknown) => {
            const definition = definitionMap.get(key);
            if (!definition) {
                return;
            }
            updateState((prev) => ({
                ...prev,
                values: { ...prev.values, [key]: value },
                touched: { ...prev.touched, [key]: true },
                dirty: true,
            }));

            void (async () => {
                const error = await runFieldValidations(definition, value, context);
                updateState((prev) => ({
                    ...prev,
                    errors: { ...prev.errors, [key]: error },
                }));
            })();

            definition.hooks?.onChange?.(value, context);
        };

        context.runValidation = async (key?: string) => {
            if (key) {
                const definition = definitionMap.get(key);
                if (!definition) {
                    return true;
                }
                const error = await runFieldValidations(definition, state.values[key], context);
                updateState((prev) => ({
                    ...prev,
                    errors: { ...prev.errors, [key]: error },
                }));
                return !error;
            }

            const validationResults = await Promise.all(
                Array.from(definitionMap.entries()).map(async ([fieldKey, definition]) => {
                    const error = await runFieldValidations(definition, state.values[fieldKey], context);
                    return { fieldKey, error };
                })
            );

            updateState((prev) => {
                const nextErrors = { ...prev.errors };
                validationResults.forEach(({ fieldKey, error }) => {
                    nextErrors[fieldKey] = error;
                });
                return { ...prev, errors: nextErrors };
            });

            return validationResults.every(({ error }) => !error);
        };

        context.submit = async () => {
            const isValid = await context.runValidation();
            if (!isValid) {
                return;
            }
            await onSubmit?.(state);
        };

        return context;
    }, [definitionMap, onSubmit, schema, state, updateState]);

    const handleReset = React.useCallback(() => {
        setState({
            values: resolveInitialValues(schema, initialValues),
            errors: {},
            touched: {},
            dirty: false,
        });
        onCancel?.();
    }, [schema, initialValues, onCancel]);

    const renderField = React.useCallback(
        (definition: FormFieldDefinition) => {
            if (definition.hidden) {
                return null;
            }

            const renderer = registry.get(definition.type);
            if (!renderer) {
                return (
                    <div key={definition.key} className="text-sm text-red-500">
                        Renderer não encontrado para o tipo &quot;{definition.type}&quot;
                    </div>
                );
            }

            return (
                <div key={definition.key} className="w-full">
                    {renderer({
                        definition,
                        value: state.values[definition.key],
                        error: state.errors[definition.key],
                        readOnly: readOnly ?? schema.readOnly,
                        onChange: (value) => runtimeContext.updateValue(definition.key, value),
                    })}
                </div>
            );
        },
        [readOnly, registry, runtimeContext, schema.readOnly, state.errors, state.values]
    );

    const renderSection = (section: FormSectionDefinition) => {
        const orientationClasses = getOrientationClasses(section.orientation);
        return (
            <section key={section.key} className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                {(section.title || section.description) && (
                    <header className="flex flex-col gap-1">
                        {section.title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{section.title}</h3>}
                        {section.description && <p className="text-sm text-slate-500 dark:text-slate-400">{section.description}</p>}
                    </header>
                )}
                <div className={orientationClasses}>{section.fields.map(renderField)}</div>
            </section>
        );
    };

    const actions: FormActionDefinition[] = schema.actions?.length
        ? schema.actions
        : [
              { key: 'cancel', label: 'Cancelar', intent: 'secondary', type: 'reset' } satisfies FormActionDefinition,
              { key: 'submit', label: 'Salvar', intent: 'primary', type: 'submit' } satisfies FormActionDefinition,
          ];

    const handleAction = async (actionKey: string) => {
        const action = actions.find((item) => item.key === actionKey);
        if (!action) {
            return;
        }
        if (action.type === 'reset') {
            handleReset();
            return;
        }
        if (action.type === 'submit') {
            await runtimeContext.submit();
            return;
        }
        await action.onTrigger?.(state, runtimeContext);
    };

    return (
        <form
            className={`flex flex-col gap-6 ${className ?? ''}`}
            onSubmit={(event) => {
                event.preventDefault();
                void runtimeContext.submit();
            }}
        >
            {renderHeader ? renderHeader(schema) : <DefaultHeader schema={schema} />}
            {schema.sections.map(renderSection)}
            <footer className="flex flex-wrap items-center justify-end gap-3">
                {actions.map((action) => (
                    <button
                        key={action.key}
                        type={action.type === 'submit' ? 'submit' : 'button'}
                        onClick={(event) => {
                            event.preventDefault();
                            void handleAction(action.key);
                        }}
                        className={buttonClasses(action.intent ?? 'secondary')}
                    >
                        {action.label}
                    </button>
                ))}
            </footer>
        </form>
    );
};

const DefaultHeader: React.FC<{ schema: FormSchema }> = ({ schema }) => {
    if (!schema.title && !schema.description) {
        return null;
    }
    return (
        <header className="flex flex-col gap-2">
            {schema.title && <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{schema.title}</h2>}
            {schema.description && <p className="text-sm text-slate-500 dark:text-slate-400">{schema.description}</p>}
        </header>
    );
};

function buttonClasses(intent: 'primary' | 'secondary' | 'danger') {
    switch (intent) {
        case 'primary':
            return 'inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50';
        case 'danger':
            return 'inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:opacity-50';
        default:
            return 'inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200';
    }
}

function getOrientationClasses(orientation: FormSectionDefinition['orientation']) {
    switch (orientation) {
        case 'horizontal':
            return 'flex flex-wrap gap-4';
        case 'grid':
            return 'grid gap-4 md:grid-cols-2';
        default:
            return 'flex flex-col gap-4';
    }
}

export function createFormTag(schema: FormSchema, options?: Omit<FormBuilderProps, 'schema'>) {
    const FormTag: React.FC<Partial<FormBuilderProps>> = (props) => (
        <FormBuilder
            schema={schema}
            initialValues={props.initialValues ?? options?.initialValues}
            registry={props.registry ?? options?.registry}
            onSubmit={props.onSubmit ?? options?.onSubmit}
            onCancel={props.onCancel ?? options?.onCancel}
            onChange={props.onChange ?? options?.onChange}
            className={`${options?.className ?? ''} ${props.className ?? ''}`.trim()}
            readOnly={props.readOnly ?? options?.readOnly}
            renderHeader={props.renderHeader ?? options?.renderHeader}
        />
    );
    FormTag.displayName = `FormTag_${schema.key}`;
    return FormTag;
}
