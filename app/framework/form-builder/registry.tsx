import React from 'react';
import {
    CustomFieldDefinition,
    FormFieldDefinition,
    FormFieldRenderProps,
    PrimitiveFieldType,
    SelectFieldDefinition,
} from './schema';

export type FieldRenderer = (props: FormFieldRenderProps) => React.ReactNode;

export class FieldRegistry {
    private renderers: Map<PrimitiveFieldType, FieldRenderer> = new Map();

    register(type: PrimitiveFieldType, renderer: FieldRenderer) {
        this.renderers.set(type, renderer);
    }

    get(type: PrimitiveFieldType) {
        return this.renderers.get(type);
    }
}

const isSelectField = (definition: FormFieldDefinition): definition is SelectFieldDefinition => definition.type === 'select';

const isCustomField = (definition: FormFieldDefinition): definition is CustomFieldDefinition => definition.type === 'custom';

const sharedInputClasses =
    'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

const sharedLabelClasses = 'text-sm font-medium text-slate-700 dark:text-slate-200';

export const defaultRegistry = new FieldRegistry();

defaultRegistry.register('text', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col gap-1">
        {definition.label && <label className={sharedLabelClasses}>{definition.label}</label>}
        <input
            type="text"
            className={`${sharedInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder={definition.placeholder}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            disabled={readOnly || definition.disabled}
        />
        {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('number', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col gap-1">
        {definition.label && <label className={sharedLabelClasses}>{definition.label}</label>}
        <input
            type="number"
            className={`${sharedInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder={definition.placeholder}
            value={value === undefined || value === null ? '' : (value as number)}
            onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
            disabled={readOnly || definition.disabled}
        />
        {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('textarea', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col gap-1">
        {definition.label && <label className={sharedLabelClasses}>{definition.label}</label>}
        <textarea
            className={`${sharedInputClasses} min-h-[96px] ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder={definition.placeholder}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            disabled={readOnly || definition.disabled}
        />
        {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('date', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col gap-1">
        {definition.label && <label className={sharedLabelClasses}>{definition.label}</label>}
        <input
            type="date"
            className={`${sharedInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            disabled={readOnly || definition.disabled}
        />
        {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('select', ({ definition, value, onChange, readOnly, error }) => {
    if (!isSelectField(definition)) {
        return null;
    }
    const selectDefinition = definition;
    return (
        <div className="flex flex-col gap-1">
            {selectDefinition.label && <label className={sharedLabelClasses}>{selectDefinition.label}</label>}
            <select
                className={`${sharedInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
                value={(value as string | number | undefined) ?? ''}
                onChange={(event) => onChange(event.target.value)}
                disabled={readOnly || selectDefinition.disabled}
            >
                <option value="" disabled>
                    {selectDefinition.placeholder ?? 'Selecione'}
                </option>
                {selectDefinition.options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {selectDefinition.description && <p className="text-xs text-slate-500">{selectDefinition.description}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
});

defaultRegistry.register('checkbox', ({ definition, value, onChange, readOnly, error }) => (
    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            disabled={readOnly || definition.disabled}
        />
        <span>
            {definition.label}
            {definition.description && <span className="ml-2 text-xs text-slate-500">{definition.description}</span>}
            {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
        </span>
    </label>
));

defaultRegistry.register('switch', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col">
        <div className="flex items-center justify-between">
            <div>
                {definition.label && <p className={sharedLabelClasses}>{definition.label}</p>}
                {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
            </div>
            <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${Boolean(value) ? 'bg-blue-600' : 'bg-slate-300'} ${readOnly || definition.disabled ? 'opacity-50' : ''}`}
                onClick={() => !readOnly && !definition.disabled && onChange(!value)}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${Boolean(value) ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('currency', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col gap-1">
        {definition.label && <label className={sharedLabelClasses}>{definition.label}</label>}
        <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900">
            <span className="text-sm text-slate-500">R$</span>
            <input
                type="number"
                className="w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none dark:text-slate-100"
                placeholder={definition.placeholder}
                value={value === undefined || value === null ? '' : (value as number)}
                step="0.01"
                onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                disabled={readOnly || definition.disabled}
            />
        </div>
        {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('percent', ({ definition, value, onChange, readOnly, error }) => (
    <div className="flex flex-col gap-1">
        {definition.label && <label className={sharedLabelClasses}>{definition.label}</label>}
        <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900">
            <input
                type="number"
                className="w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none dark:text-slate-100"
                placeholder={definition.placeholder}
                value={value === undefined || value === null ? '' : (value as number)}
                step="0.01"
                onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                disabled={readOnly || definition.disabled}
            />
            <span className="text-sm text-slate-500">%</span>
        </div>
        {definition.description && <p className="text-xs text-slate-500">{definition.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

defaultRegistry.register('custom', ({ definition, value, onChange, readOnly, error }) => {
    if (!isCustomField(definition)) {
        return null;
    }
    return definition.renderer({ definition, value, onChange, readOnly, error });
});
