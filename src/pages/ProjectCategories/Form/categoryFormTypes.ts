import type { Category, CategoryType } from '@/api/categoriesApi';

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
