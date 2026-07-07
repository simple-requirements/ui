import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import {
    getProjectCategoriesRoute,
    getProjectCategoryCreateRoute,
    getProjectCategoryDetailsRoute,
    getProjectCategoryEditRoute,
} from '@/router/projectRoutes';
import { useDirtyFormNavigationGuard } from '@/components/FormNavigation/useDirtyFormNavigationGuard';
import { openTab } from '@/stores/tabBarStore';

import type { CategoryFormMode } from '@/pages/ProjectCategories/Form/categoryFormTypes';

export type CategoryFormNavigation = Readonly<{
    formRoute: string;
    allowNavigation: () => void;
    dirtyNavigationDialogVisible: boolean;
    stayOnPage: () => void;
    discardChanges: () => void;
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

    const dirtyFormNavigation = useDirtyFormNavigationGuard(isDirty, allowNavigationRef);

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
        if (projectId === undefined) {
            return;
        }

        const abortRoute =
            mode === 'update' && categoryId !== undefined ?
                getProjectCategoryDetailsRoute(projectId, categoryId)
            :   getProjectCategoriesRoute(projectId);

        dirtyFormNavigation.requestNavigation(() => {
            void navigate(abortRoute);
        });
    }

    return {
        formRoute,
        allowNavigation,
        dirtyNavigationDialogVisible: dirtyFormNavigation.dialogVisible,
        stayOnPage: dirtyFormNavigation.stayOnPage,
        discardChanges: dirtyFormNavigation.discardChanges,
        handleAbort,
    };
}
