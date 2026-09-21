import { z, type ZodError } from 'zod';

import {
    createRequirementRequestSchema,
    requirementPrioritySchema,
    updateRequirementRequestSchema,
    type Requirement,
} from '@/api/requirementsApi';

import type {
    RequirementFormFieldName,
    RequirementFormState,
    RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

const priorityFormSchema = z
    .union([requirementPrioritySchema, z.literal('')])
    .transform((value) => (value === '' ? null : value));

export const createRequirementFormSchema = createRequirementRequestSchema.extend({ priority: priorityFormSchema });
export const updateRequirementFormSchema = updateRequirementRequestSchema.extend({ priority: priorityFormSchema });

/** Returns the validation schema for the selected requirement form mode.
 * @param mode Requirement form mode.
 * @returns The corresponding create or update schema.
 */
export function getRequirementFormSchema(mode: 'create' | 'update') {
    return mode === 'create' ? createRequirementFormSchema : updateRequirementFormSchema;
}

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
            || fieldName === 'changeReason'
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
            changeReason: '',
        };
    }

    return {
        categoryId: initialCategoryId ?? '',
        description: '',
        priority: 'p1',
        owner: '',
        rationale: '',
        source: '',
        changeReason: '',
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
