import type { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import { type RefObject, type SyntheticEvent, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router';

import type { Category } from '@/api/categoriesApi';
import { deleteProjectCategoryRequest, getListProjectCategoriesQueryKey } from '@/api/categoriesApi';
import { queryClient } from '@/api/queryClient';
import {
    getProjectCategoryDetailsRoute,
    getProjectCategoryEditRoute,
    getProjectRequirementCreateRoute,
} from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';

import { canDeleteCategory, type CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';

type CategoryNavigationTarget = Pick<Category, 'id' | 'key'>;

type UseCategoryListControllerOptions = Readonly<{
    projectId: string | undefined;
    navigate: NavigateFunction;
    setSelectedCategoryId: (
        updater: string | undefined | ((categoryId: string | undefined) => string | undefined),
    ) => void;
}>;

export type CategoryListController = Readonly<{
    contextMenuRef: RefObject<ContextMenu | null>;
    contextMenuItems: MenuItem[];
    deleteCategoryCandidate: CategoryTableRow | undefined;
    deletePending: boolean;
    copyCategoryKey: (category: CategoryTableRow) => Promise<void>;
    openCategory: (category: CategoryTableRow) => void;
    editCategory: (category: CategoryNavigationTarget) => void;
    openContextMenu: (category: CategoryTableRow, event: SyntheticEvent) => void;
    abortDeleteCategory: () => void;
    confirmDeleteCategory: () => Promise<void>;
}>;

export function useCategoryListController({
    projectId,
    navigate,
    setSelectedCategoryId,
}: UseCategoryListControllerOptions): CategoryListController {
    const contextMenuRef = useRef<ContextMenu | null>(null);
    const [contextMenuCategory, setContextMenuCategory] = useState<CategoryTableRow>();
    const [deleteCategoryCandidate, setDeleteCategoryCandidate] = useState<CategoryTableRow>();
    const [deletePending, setDeletePending] = useState(false);

    async function copyCategoryKey(category: CategoryTableRow): Promise<void> {
        await navigator.clipboard.writeText(category.key);

        showToastMessage({
            severity: 'success',
            summary: 'Category key copied',
            detail: `${category.key} has been copied to the clipboard.`,
            life: 3000,
        });
    }

    function editCategory(category: CategoryNavigationTarget): void {
        if (projectId === undefined) {
            return;
        }

        const categoryDetailsRoute = getProjectCategoryDetailsRoute(projectId, category.id);
        const categoryEditRoute = getProjectCategoryEditRoute(projectId, category.id);

        openTab({ id: categoryDetailsRoute, label: `Category ${category.key}`, closable: true });
        void navigate(categoryEditRoute);
    }

    function requestDeleteCategory(category: CategoryTableRow): void {
        if (!canDeleteCategory(category)) {
            showToastMessage({
                severity: 'warn',
                summary: 'Category cannot be deleted',
                detail: `${category.key} still contains requirements. Remove its requirements before deleting the category.`,
                life: 5000,
            });

            return;
        }

        setDeleteCategoryCandidate(category);
    }

    async function confirmDeleteCategory(): Promise<void> {
        if (projectId === undefined || deleteCategoryCandidate === undefined) {
            return;
        }

        const category = deleteCategoryCandidate;
        setDeletePending(true);

        try {
            await deleteProjectCategoryRequest(projectId, category.id);
            await queryClient.invalidateQueries({ queryKey: getListProjectCategoriesQueryKey(projectId) });

            setSelectedCategoryId((currentSelectedCategoryId) =>
                currentSelectedCategoryId === category.id ? undefined : currentSelectedCategoryId,
            );
            setContextMenuCategory(undefined);
            setDeleteCategoryCandidate(undefined);

            showToastMessage({
                severity: 'success',
                summary: 'Category deleted',
                detail: `${category.key} has been deleted.`,
                life: 3000,
            });
        } catch {
            showToastMessage({
                severity: 'error',
                summary: 'Category could not be deleted',
                detail: `${category.key} could not be deleted.`,
                life: 5000,
            });
        } finally {
            setDeletePending(false);
        }
    }

    function addRequirement(category: CategoryTableRow): void {
        if (projectId === undefined) {
            return;
        }

        void navigate(getProjectRequirementCreateRoute(projectId, category.id));
    }

    function openCategory(category: CategoryTableRow): void {
        if (projectId === undefined) {
            return;
        }

        const categoryDetailsRoute = getProjectCategoryDetailsRoute(projectId, category.id);

        setSelectedCategoryId(category.id);
        openTab({ id: categoryDetailsRoute, label: `Category ${category.key}`, closable: true });
        void navigate(categoryDetailsRoute);
    }

    function openContextMenu(category: CategoryTableRow, event: SyntheticEvent): void {
        setContextMenuCategory(category);
        contextMenuRef.current?.show(event);
    }

    const contextMenuItems: MenuItem[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                if (contextMenuCategory !== undefined) {
                    editCategory(contextMenuCategory);
                }
            },
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            disabled: contextMenuCategory === undefined || !canDeleteCategory(contextMenuCategory),
            command: () => {
                if (contextMenuCategory !== undefined) {
                    requestDeleteCategory(contextMenuCategory);
                }
            },
        },
        {
            label: 'Add requirement',
            icon: 'pi pi-plus',
            command: () => {
                if (contextMenuCategory !== undefined) {
                    addRequirement(contextMenuCategory);
                }
            },
        },
    ];

    return {
        contextMenuRef,
        contextMenuItems,
        deleteCategoryCandidate,
        deletePending,
        copyCategoryKey,
        openCategory,
        editCategory,
        openContextMenu,
        abortDeleteCategory: () => setDeleteCategoryCandidate(undefined),
        confirmDeleteCategory,
    };
}
