import type { Category } from '@/api/categoriesApi';
import type { Requirement } from '@/api/requirementsApi';

export type RequirementFormMode = 'create' | 'update';
export type RequirementFormFieldName =
    | 'categoryId'
    | 'description'
    | 'priority'
    | 'owner'
    | 'rationale'
    | 'source'
    | 'changeReason';
export type RequirementFormValues = Readonly<Record<RequirementFormFieldName, string>>;
export type RequirementFormState = Readonly<{
    fieldErrors: Partial<Record<RequirementFormFieldName, string>>;
    formError?: string;
}>;

export type RequirementFormData = Readonly<{
    categories: readonly Category[];
    requirement: Requirement | undefined;
    loading: boolean;
    error: boolean;
}>;

export const emptyRequirementFormState: RequirementFormState = { fieldErrors: {} };
export const createRequirementInitialValues: RequirementFormValues = {
    categoryId: '',
    description: '',
    priority: 'p1',
    owner: '',
    rationale: '',
    source: '',
    changeReason: '',
};
