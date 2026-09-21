import type { ZodError } from 'zod';

import type { Category } from '@/api/categoriesApi';

import type {
    CategoryFormFieldName,
    CategoryFormState,
    CategoryFormValues,
} from '@/pages/ProjectCategories/Form/categoryFormTypes';

export class CategoryFormValidationError extends Error {
    readonly fieldErrors: CategoryFormState['fieldErrors'];

    constructor(fieldErrors: CategoryFormState['fieldErrors']) {
        super('Category form validation failed.');
        this.fieldErrors = fieldErrors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function getCategoryFormDataString(formData: FormData, fieldName: string): string {
    const value = formData.get(fieldName);

    return typeof value === 'string' ? value : '';
}

export function getCategoryFormFieldErrors(error: ZodError): CategoryFormState['fieldErrors'] {
    const fieldErrors: Partial<Record<CategoryFormFieldName, string>> = {};

    for (const issue of error.issues) {
        const fieldName = issue.path.at(0);

        if (fieldName === 'name' || fieldName === 'key' || fieldName === 'type') {
            fieldErrors[fieldName] ??= issue.message;
        }
    }

    return fieldErrors;
}

export function hasCategoryFormChanges(values: CategoryFormValues, initialValues: CategoryFormValues): boolean {
    return values.name !== initialValues.name || values.key !== initialValues.key || values.type !== initialValues.type;
}

export function getDuplicateCategoryNameError(
    categories: readonly Category[],
    name: string,
    currentCategoryId: string | undefined,
): string | undefined {
    const duplicateCategory = categories.find(
        (category) => category.id !== currentCategoryId && category.name === name,
    );

    return duplicateCategory === undefined ? undefined : 'Name must be unique within the project.';
}

export function getDuplicateCategoryKeyError(categories: readonly Category[], key: string): string | undefined {
    const duplicateCategory = categories.find((category) => category.key === key);

    return duplicateCategory === undefined ? undefined : 'Key must be unique within the project.';
}
