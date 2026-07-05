import type { Category, CategoryType } from '@/api/categoriesApi';

export const DISCARD_CATEGORY_FORM_CHANGES_MESSAGE = 'Your input will be lost. Do you want to continue?';

export type CategoryFormMode = 'create' | 'update';
export type CategoryFormFieldName = 'name' | 'key' | 'type';
export type CategoryFormValues = Readonly<{ name: string; key: string; type: CategoryType }>;
export type CategoryFormState = Readonly<{
    fieldErrors: Partial<Record<CategoryFormFieldName, string>>;
    formError?: string;
}>;

export type CategoryFormData = Readonly<{
    categories: readonly Category[];
    category: Category | undefined;
    loading: boolean;
    error: boolean;
}>;

export const emptyCategoryFormState: CategoryFormState = { fieldErrors: {} };
export const createCategoryInitialValues: CategoryFormValues = { name: '', key: '', type: 'FR' };
