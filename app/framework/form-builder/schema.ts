import React from 'react';

export type PrimitiveFieldType = 'text' | 'number' | 'textarea' | 'date' | 'select' | 'checkbox' | 'switch' | 'currency' | 'percent' | 'custom';

export type FieldValidationRule =
    | { type: 'required'; message?: string }
    | { type: 'min'; value: number; message?: string }
    | { type: 'max'; value: number; message?: string }
    | { type: 'pattern'; value: RegExp; message?: string }
        | {
                    type: 'custom';
                    validate: (value: unknown, context?: FormRuntimeContext) => boolean | Promise<boolean>;
                    message?: string;
            };

export type FieldLayout =
    | { span?: number; row?: number; col?: number }
    | { width?: 'auto' | 'full' | 'half' | 'third' };

export interface FieldActionHook {
    onFocus?: (context: FormRuntimeContext) => void;
    onBlur?: (context: FormRuntimeContext) => void;
    onChange?: (value: unknown, context: FormRuntimeContext) => void;
}

export interface BaseFieldDefinition {
    key: string;
    label?: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    hidden?: boolean;
    type: PrimitiveFieldType;
    layout?: FieldLayout;
    defaultValue?: unknown;
    validations?: FieldValidationRule[];
    hooks?: FieldActionHook;
    meta?: Record<string, unknown>;
}

export interface SelectFieldDefinition extends BaseFieldDefinition {
    type: 'select';
    options: Array<{ label: string; value: string | number }>;
    searchable?: boolean;
}

export interface CustomFieldDefinition extends BaseFieldDefinition {
    type: 'custom';
    renderer: (props: FormFieldRenderProps) => React.ReactNode;
}

export type FormFieldDefinition = BaseFieldDefinition | SelectFieldDefinition | CustomFieldDefinition;

export type FormSectionOrientation = 'horizontal' | 'vertical' | 'grid';

export interface FormSectionDefinition {
    key: string;
    title?: string;
    description?: string;
    orientation?: FormSectionOrientation;
    fields: FormFieldDefinition[];
}

export type FormActionDefinition = {
    key: string;
    label: string;
    intent?: 'primary' | 'secondary' | 'danger';
    type?: 'submit' | 'reset' | 'custom';
    icon?: React.ReactNode;
    onTrigger?: (state: FormRuntimeState, context: FormRuntimeContext) => Promise<void> | void;
};

export interface FormSchema {
    key: string;
    title?: string;
    description?: string;
    sections: FormSectionDefinition[];
    actions?: FormActionDefinition[];
    mode?: 'minimal' | 'advanced';
    readOnly?: boolean;
    meta?: Record<string, unknown>;
}

export interface FormRuntimeState {
    values: Record<string, unknown>;
    errors: Record<string, string | undefined>;
    touched: Record<string, boolean>;
    dirty: boolean;
}

export interface FormRuntimeContext {
    schema: FormSchema;
    updateValue: (key: string, value: unknown) => void;
    runValidation: (key?: string) => Promise<boolean>;
    submit: () => Promise<void>;
}

export interface FormFieldRenderProps {
    definition: FormFieldDefinition;
    value: unknown;
    error?: string;
    readOnly?: boolean;
    onChange: (value: unknown) => void;
}
