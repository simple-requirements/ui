import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import {
    categoryTypeSchema,
    createCategoryRequestSchema,
    createProjectCategoryRequest,
    getListProjectCategoriesQueryKey,
    updateCategoryRequestSchema,
    updateProjectCategoryRequest,
    type Category,
} from '@/api/categoriesApi';
import { queryClient } from '@/api/queryClient';
import {
    getProjectCategoriesRoute,
    getProjectCategoryCreateRoute,
    getProjectCategoryDetailsRoute,
    getProjectCategoryEditRoute,
} from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';

import {
    createCategoryInitialValues,
    DISCARD_CATEGORY_FORM_CHANGES_MESSAGE,
    emptyCategoryFormState,
    type CategoryFormData,
    type CategoryFormFieldName,
    type CategoryFormMode,
    type CategoryFormState,
    type CategoryFormValues,
} from '@/pages/ProjectCategories/Form/categoryFormTypes';
import {
    CategoryFormValidationError,
    getCategoryFormDataString,
    getCategoryFormFieldErrors,
    getDuplicateCategoryKeyError,
    getDuplicateCategoryNameError,
    hasCategoryFormChanges,
} from '@/pages/ProjectCategories/Form/categoryFormValidation';
import { useUnsavedCategoryFormGuard } from '@/pages/ProjectCategories/Form/useUnsavedCategoryFormGuard';

export type CategoryFormController = Readonly<{
    formKey: string;
    formRoute: string;
    formTitle: string;
    formValues: CategoryFormValues;
    formState: CategoryFormState;
    isDirty: boolean;
    pending: boolean;
    updateFormValue: (fieldName: CategoryFormFieldName, value: string) => void;
    handleAbort: () => void;
    formAction: (payload: FormData) => void;
}>;

function getInitialValues(mode: CategoryFormMode, category: Category | undefined): CategoryFormValues {
    if (mode === 'create' || category === undefined) {
        return createCategoryInitialValues;
    }

    return { name: category.name, key: category.key, type: category.type };
}

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

export function useCategoryFormController(
    projectId: string | undefined,
    categoryId: string | undefined,
    mode: CategoryFormMode,
    data: CategoryFormData,
): CategoryFormController {
    const navigate = useNavigate();
    const allowNavigationRef = useRef(false);
    const initialValues = useMemo(() => getInitialValues(mode, data.category), [data.category, mode]);
    const formKey = `${mode}:${data.category?.id ?? projectId ?? 'missing-project'}`;
    const formTitle = mode === 'create' ? 'Create category' : 'Update category';
    const formRoute =
        projectId === undefined ?
            ''
        : mode === 'create' ?
            getProjectCategoryCreateRoute(projectId)
        :   getProjectCategoryEditRoute(projectId, categoryId ?? '');

    const [formValues, setFormValues] = useState<CategoryFormValues>(initialValues);

    useEffect(() => {
        setFormValues(initialValues);
    }, [formKey, initialValues]);

    const isDirty = hasCategoryFormChanges(formValues, initialValues);

    useUnsavedCategoryFormGuard(isDirty, allowNavigationRef);

    const [formState, formAction, pending] = useActionState<CategoryFormState, FormData>(
        async (_previousState, formData) => {
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
                    mode === 'create' ?
                        await createCategory(projectId, rawValues, data.categories)
                    :   categoryId === undefined ?
                        undefined
                    :   await updateProjectCategoryRequest(projectId, categoryId, parseResult.data);

                if (savedCategory === undefined) {
                    return { fieldErrors: {}, formError: 'Category route is incomplete.' };
                }

                await queryClient.invalidateQueries({ queryKey: getListProjectCategoriesQueryKey(projectId) });

                const detailsRoute = getProjectCategoryDetailsRoute(projectId, savedCategory.id);

                showToastMessage({
                    severity: 'success',
                    summary: mode === 'create' ? 'Category created' : 'Category updated',
                    detail: `${savedCategory.key} has been ${mode === 'create' ? 'created' : 'updated'}.`,
                    life: 3000,
                });

                allowNavigationRef.current = true;
                openTab({ id: detailsRoute, label: `Category ${savedCategory.key}`, closable: true });
                void navigate(detailsRoute);

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
        },
        emptyCategoryFormState,
    );

    function updateFormValue(fieldName: CategoryFormFieldName, value: string): void {
        if (fieldName === 'type') {
            const typeParseResult = categoryTypeSchema.safeParse(value);

            if (!typeParseResult.success) {
                return;
            }

            setFormValues((currentValues) => ({ ...currentValues, type: typeParseResult.data }));

            return;
        }

        setFormValues((currentValues) => ({
            ...currentValues,
            [fieldName]: fieldName === 'key' ? value.toUpperCase() : value,
        }));
    }

    function handleAbort(): void {
        if (isDirty && !window.confirm(DISCARD_CATEGORY_FORM_CHANGES_MESSAGE)) {
            return;
        }

        if (projectId === undefined) {
            return;
        }

        allowNavigationRef.current = true;
        void navigate(getProjectCategoriesRoute(projectId));
    }

    return {
        formKey,
        formRoute,
        formTitle,
        formValues,
        formState,
        isDirty,
        pending,
        updateFormValue,
        handleAbort,
        formAction,
    };
}
