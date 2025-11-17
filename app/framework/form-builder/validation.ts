import { FieldValidationRule, FormFieldDefinition, FormRuntimeContext } from './schema';

export async function runFieldValidations(
    definition: FormFieldDefinition,
    value: unknown,
    context: FormRuntimeContext
): Promise<string | undefined> {
    if (!definition.validations?.length) {
        return undefined;
    }

    for (const rule of definition.validations) {
        const error = await evaluateRule(rule, value, context);
        if (error) {
            return error;
        }
    }

    return undefined;
}

async function evaluateRule(rule: FieldValidationRule, value: unknown, context: FormRuntimeContext) {
    const message = rule.message ?? getDefaultMessage(rule);
    switch (rule.type) {
        case 'required':
            if (value === undefined || value === null || value === '') {
                return message;
            }
            break;
        case 'min':
            if (typeof value === 'number' && value < rule.value) {
                return message;
            }
            if (typeof value === 'string' && value.length < rule.value) {
                return message;
            }
            break;
        case 'max':
            if (typeof value === 'number' && value > rule.value) {
                return message;
            }
            if (typeof value === 'string' && value.length > rule.value) {
                return message;
            }
            break;
        case 'pattern':
            if (typeof value === 'string' && !rule.value.test(value)) {
                return message;
            }
            break;
        case 'custom':
            if (!(await rule.validate(value, context))) {
                return message;
            }
            break;
    }
    return undefined;
}

function getDefaultMessage(rule: FieldValidationRule) {
    switch (rule.type) {
        case 'required':
            return 'Campo obrigatório';
        case 'min':
            return `Valor mínimo ${rule.value}`;
        case 'max':
            return `Valor máximo ${rule.value}`;
        case 'pattern':
            return 'Formato inválido';
        case 'custom':
            return 'Valor inválido';
        default:
            return 'Erro de validação';
    }
}
