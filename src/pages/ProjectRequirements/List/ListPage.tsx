import type { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import type { SyntheticEvent } from 'react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Category } from '@/api/categoriesApi';
import { deleteProjectCategoryRequest, getListProjectCategoriesQueryKey } from '@/api/categoriesApi';
import { queryClient } from '@/api/queryClient';
import { AppContextMenu } from '@/components/ContextMenu/AppContextMenu';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import {
    getProjectCategoryDetailsRoute,
    getProjectCategoryEditRoute,
    getProjectRequirementCreateRoute,
} from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';

import { CategoryDetailsPanel } from '@/pages/ProjectCategories/CategoryDetailsPanel';
import { CategoryDeleteDialog } from '@/pages/ProjectCategories/List/CategoryDeleteDialog';
import { CategoryTable } from '@/pages/ProjectCategories/List/CategoryTable';
import { canDeleteCategory, type CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';
import { useProjectCategoriesList } from '@/pages/ProjectCategories/List/useProjectCategoriesList';

import '@/pages/ProjectCategories/List/ListPage.scss';

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const categoryContextMenuRef = useRef<ContextMenu | null>(null);
    const [contextMenuCategory, setContextMenuCategory] = useState<CategoryTableRow>();
    const [deleteCategoryCandidate, setDeleteCategoryCandidate] = useState<CategoryTableRow>();
    const [deletePending, setDeletePending] = useState(false);

    const {
        categories,
        categoriesQuery,
        selectedCategory,
        selectedCategoryId,
        setSelectedCategoryId,
    } = useProjectCategoriesList(projectId);

    async function copyCategoryKey(category: CategoryTableRow): Promise<void> {
        await navigator.clipboard.writeText(category.key);

        showToastMessage({
            severity: 'success',
            summary: 'Category key copied',
            detail: `${category.key} has been copied to the clipboard.`,
            life: 3000,
        });
    }

    function handleEditCategory(category: Pick<Category, 'id' | 'key'>): void {
        if (projectId === undefined) {
            return;
        }

        const categoryDetailsRoute = getProjectCategoryDetailsRoute(projectId, category.id);
        const categoryEditRoute = getProjectCategoryEditRoute(projectId, category.id);

        openTab({ id: categoryDetailsRoute, label: `Category ${category.key}`, closable: true });
        void navigate(categoryEditRoute);
    }

    function handleDeleteCategoryRequest(category: CategoryTableRow): void {
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

    async function handleConfirmDeleteCategory(): Promise<void> {
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

    function handleAddRequirement(category: Pick<Category, 'id'>): void {
        if (projectId === undefined) {
            return;
        }

        void navigate(getProjectRequirementCreateRoute(projectId, category.id));
    }

    function handleOpenCategory(category: Pick<Category, 'id' | 'key'>): void {
        if (projectId === undefined) {
            return;
        }

        const categoryDetailsRoute = getProjectCategoryDetailsRoute(projectId, category.id);

        setSelectedCategoryId(category.id);
        openTab({ id: categoryDetailsRoute, label: `Category ${category.key}`, closable: true });
        void navigate(categoryDetailsRoute);
    }

    function handleOpenContextMenu(category: CategoryTableRow, event: SyntheticEvent): void {
        setContextMenuCategory(category);
        categoryContextMenuRef.current?.show(event);
    }

    const categoryContextMenuItems: MenuItem[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                if (contextMenuCategory !== undefined) {
                    handleEditCategory(contextMenuCategory);
                }
            },
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            disabled: contextMenuCategory === undefined || !canDeleteCategory(contextMenuCategory),
            command: () => {
                if (contextMenuCategory !== undefined) {
                    handleDeleteCategoryRequest(contextMenuCategory);
                }
            },
        },
        {
            label: 'Add requirement',
            icon: 'pi pi-plus',
            command: () => {
                if (contextMenuCategory !== undefined) {
                    handleAddRequirement(contextMenuCategory);
                }
            },
        },
    ];

    if (projectId === undefined) {
        return (
            <section className='project-categories-list-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-categories-list-page'
            aria-labelledby='project-categories-list-page-title'>
            <AppContextMenu
                ref={categoryContextMenuRef}
                model={categoryContextMenuItems}
            />
            <CategoryDeleteDialog
                category={deleteCategoryCandidate}
                pending={deletePending}
                onAbort={() => setDeleteCategoryCandidate(undefined)}
                onConfirm={() => {
                    void handleConfirmDeleteCategory();
                }}
            />

            <Splitter
                layout='vertical'
                pt={{ root: { className: 'project-categories-list-page__splitter' } }}>
                <SplitterPanel
                    size={67}
                    minSize={25}
                    pt={{ root: { className: 'project-categories-list-page__splitter-panel' } }}>
                    <div className='project-categories-list-page__list-panel'>
                        <header className='project-categories-list-page__header'>
                            <h1
                                id='project-categories-list-page-title'
                                className='project-categories-list-page__title'>
                                Categories
                            </h1>
                        </header>

                        <LoadableContent
                            loading={categoriesQuery.isLoading}
                            error={categoriesQuery.isError}
                            empty={categories.length === 0}
                            loadingMessage='Loading categories …'
                            errorMessage='Categories could not be loaded.'
                            emptyMessage='No categories available.'>
                            <CategoryTable
                                categories={categories}
                                selectedCategory={selectedCategory}
                                selectedCategoryId={selectedCategoryId}
                                onSelectCategory={setSelectedCategoryId}
                                onCopyCategoryKey={(category) => {
                                    void copyCategoryKey(category);
                                }}
                                onOpenCategory={handleOpenCategory}
                                onOpenContextMenu={handleOpenContextMenu}
                            />
                        </LoadableContent>
                    </div>
                </SplitterPanel>

                <SplitterPanel
                    size={33}
                    minSize={20}
                    pt={{ root: { className: 'project-categories-list-page__splitter-panel' } }}>
                    <CategoryDetailsPanel
                        category={selectedCategory}
                        title='Category details'
                        onEditCategory={handleEditCategory}
                    />
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
