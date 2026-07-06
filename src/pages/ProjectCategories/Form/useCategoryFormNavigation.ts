import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import {
    getProjectCategoriesRoute,
    getProjectCategoryCreateRoute,
    getProjectCategoryDetailsRoute,
    getProjectCategoryEditRoute,
} from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';

import {
    DISCARD_CATEGORY_FORM_CHANGES_MESSAGE,
    type CategoryFormMode,
} from '@/pages/ProjectCategories/Form/categoryFormTypes';
import { useUnsavedCategoryFormGuard } from '@/pages/ProjectCategories/Form/useUnsavedCategoryFormGuard';

export type CategoryFormNavigation = Readonly<{
    formRoute: string;
    allowNavigation: () => void;
    handleAbort: () => void;
}>;

export function useCategoryFormNavigation(
    projectId: string | undefined,
    categoryId: string | undefined,
    mode: CategoryFormMode,
    isDirty: boolean,
    loadedCategoryId: string | undefined,
    loadedCategoryKey: string | undefined,
): CategoryFormNavigation {
    const navigate = useNavigate();
    const allowNavigationRef = useRef(false);

    useUnsavedCategoryFormGuard(isDirty, allowNavigationRef);

    useEffect(() => {
        if (
            mode !== 'update'
            || projectId === undefined
            || loadedCategoryId === undefined
            || loadedCategoryKey === undefined
        ) {
            return;
        }

        openTab({
            id: getProjectCategoryDetailsRoute(projectId, loadedCategoryId),
            label: `Category ${loadedCategoryKey}`,
            closable: true,
        });
    }, [loadedCategoryId, loadedCategoryKey, mode, projectId]);

    const formRoute =
        projectId === undefined ? ''
        : mode === 'create' ? getProjectCategoryCreateRoute(projectId)
        : getProjectCategoryEditRoute(projectId, categoryId ?? '');

    function allowNavigation(): void {
        allowNavigationRef.current = true;
    }

    function handleAbort(): void {
        if (isDirty && !window.confirm(DISCARD_CATEGORY_FORM_CHANGES_MESSAGE)) {
            return;
        }

        if (projectId === undefined) {
            return;
        }

        const abortRoute =
            mode === 'update' && categoryId !== undefined ?
                getProjectCategoryDetailsRoute(projectId, categoryId)
            :   getProjectCategoriesRoute(projectId);

        allowNavigation();
        void navigate(abortRoute);
    }

    return { formRoute, allowNavigation, handleAbort };
}
