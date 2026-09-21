import { useActionState } from 'react';

import {
    createCategoryRequestSchema,
    createProjectCategoryRequest,
    getListProjectCategoriesQueryKey,
    updateCategoryRequestSchema,
    updateProjectCategoryRequest,
    type Category,
} from '@/api/categoriesApi';
import { queryClient } from '@/api/queryClient';

import {
    emptyCategoryFormState,
    type CategoryFormData,
    type CategoryFormMode,
    type CategoryFormState,
} from '@/pages/ProjectCategories/Form/categoryFormTypes';
import {
    CategoryFormValidationError,
    getCategoryFormDataString,
    getCategoryFormFieldErrors,
    getDuplicateCategoryKeyError,
    getDuplicateCategoryNameError,
} from '@/pages/ProjectCategories/Form/categoryFormValidation';

export type UseCategoryFormActionOptions = Readonly<{
    projectId: string | undefined;
    categoryId: string | undefined;
    mode: CategoryFormMode;
    data: CategoryFormData;
    onSaved: (category: Category) => void;
}>;

async function createCategory(
    projectId: string,
    rawValues: Readonly<{ name: string; key: string; type: string }>,
    categories: readonly Category[],
): Promise<Category> {
    const parseResult = createCategoryRequestSchema.safeParse(rawValues);

    if (!parseResult.success) {
        throw new Error('Create category validation failed.');
    }

    const duplicateKeyError = getDuplicateCategoryKeyError(categories, parseResult.data.key);

    if (duplicateKeyError !== undefined) {
        throw new CategoryFormValidationError({ key: duplicateKeyError });
    }

    return createProjectCategoryRequest(projectId, parseResult.data);
}

export function useCategoryFormAction({ projectId, categoryId, mode, data, onSaved }: UseCategoryFormActionOptions) {
    return useActionState<CategoryFormState, FormData>(async (_previousState, formData) => {
        if (projectId === undefined) {
            return { fieldErrors: {}, formError: 'Project route is missing a project id.' };
        }

        const rawValues = {
            name: getCategoryFormDataString(formData, 'name'),
            key: getCategoryFormDataString(formData, 'key'),
            type: getCategoryFormDataString(formData, 'type'),
        };

        const parseResult =
            mode === 'create' ?
                createCategoryRequestSchema.safeParse(rawValues)
            :   updateCategoryRequestSchema.safeParse({ name: rawValues.name });

        if (!parseResult.success) {
            return { fieldErrors: getCategoryFormFieldErrors(parseResult.error) };
        }

        const duplicateNameError = getDuplicateCategoryNameError(data.categories, parseResult.data.name, categoryId);

        if (duplicateNameError !== undefined) {
            return { fieldErrors: { name: duplicateNameError } };
        }

        try {
            const savedCategory =
                mode === 'create' ? await createCategory(projectId, rawValues, data.categories)
                : categoryId === undefined ? undefined
                : await updateProjectCategoryRequest(projectId, categoryId, parseResult.data);

            if (savedCategory === undefined) {
                return { fieldErrors: {}, formError: 'Category route is incomplete.' };
            }

            await queryClient.invalidateQueries({ queryKey: getListProjectCategoriesQueryKey(projectId) });
            onSaved(savedCategory);

            return emptyCategoryFormState;
        } catch (error) {
            if (error instanceof CategoryFormValidationError) {
                return { fieldErrors: error.fieldErrors };
            }

            return {
                fieldErrors: {},
                formError: error instanceof Error ? error.message : 'Category could not be saved.',
            };
        }
    }, emptyCategoryFormState);
}
