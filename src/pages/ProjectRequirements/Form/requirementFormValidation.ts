import { z, type ZodError } from 'zod';

import { createRequirementRequestSchema, requirementPrioritySchema, type Requirement } from '@/api/requirementsApi';

import type {
    RequirementFormFieldName,
    RequirementFormState,
    RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export const requirementFormSchema = createRequirementRequestSchema.extend({
    priority: z.union([requirementPrioritySchema, z.literal('')]).transform((value) => (value === '' ? null : value)),
});

export function getRequirementFormDataString(formData: FormData, fieldName: string): string {
    const value = formData.get(fieldName);

    return typeof value === 'string' ? value : '';
}

export function getRequirementFormFieldErrors(error: ZodError): RequirementFormState['fieldErrors'] {
    const fieldErrors: Partial<Record<RequirementFormFieldName, string>> = {};

    for (const issue of error.issues) {
        const fieldName = issue.path.at(0);

        if (
            fieldName === 'categoryId'
            || fieldName === 'description'
            || fieldName === 'priority'
            || fieldName === 'owner'
            || fieldName === 'rationale'
            || fieldName === 'source'
        ) {
            fieldErrors[fieldName] ??= issue.message;
        }
    }

    return fieldErrors;
}

export function getInitialRequirementFormValues(
    mode: 'create' | 'update',
    requirement: Requirement | undefined,
    initialCategoryId: string | undefined,
): RequirementFormValues {
    if (mode === 'update' && requirement !== undefined) {
        return {
            categoryId: requirement.categoryId,
            description: requirement.description ?? '',
            priority: requirement.priority ?? '',
            owner: requirement.owner ?? '',
            rationale: requirement.rationale ?? '',
            source: requirement.source ?? '',
        };
    }

    return {
        categoryId: initialCategoryId ?? '',
        description: '',
        priority: 'p1',
        owner: '',
        rationale: '',
        source: '',
    };
}

export function hasRequirementFormChanges(
    values: RequirementFormValues,
    initialValues: RequirementFormValues,
): boolean {
    return Object.keys(values).some((fieldName) => {
        const key = fieldName as RequirementFormFieldName;

        return values[key] !== initialValues[key];
    });
}
