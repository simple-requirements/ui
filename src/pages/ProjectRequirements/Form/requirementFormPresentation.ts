import type { Category } from '@/api/categoriesApi';
import { requirementPrioritySchema } from '@/api/requirementsApi';

import type {
    RequirementFormFieldName,
    RequirementFormMode,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export const optionalPriorityValues = ['', ...requirementPrioritySchema.options] as const;

export function getRequirementFormTitle(mode: RequirementFormMode): string {
    return mode === 'create' ? 'Create requirement' : 'Update requirement';
}

export function getRequirementFormKey(
    mode: RequirementFormMode,
    projectId: string | undefined,
    requirementId: string | undefined,
    initialCategoryId: string | undefined,
): string {
    return `${mode}:${requirementId ?? projectId ?? 'missing-project'}:${initialCategoryId ?? ''}`;
}

export function getCategoryLabel(category: Category): string {
    return `${category.key} — ${category.name} (${category.type})`;
}

export function getRequirementFieldHint(
    fieldName: RequirementFormFieldName,
    errorMessage: string | undefined,
): string | undefined {
    if (errorMessage !== undefined) {
        return undefined;
    }

    if (fieldName === 'categoryId') {
        return 'Choose the category that defines the requirement key prefix.';
    }

    if (fieldName === 'priority') {
        return 'Choose an optional priority.';
    }

    if (fieldName === 'owner') {
        return 'Enter an optional owner name.';
    }

    return 'Optional requirement text.';
}
