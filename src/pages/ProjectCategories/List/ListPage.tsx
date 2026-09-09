import { useNavigate, useParams } from 'react-router';

import { AppContextMenu } from '@/components/ContextMenu/AppContextMenu';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { InlineStatus } from '@/components/Feedback/InlineStatus';

import { CategoryDeleteDialog } from '@/pages/ProjectCategories/List/CategoryDeleteDialog';
import { CategoryListPanels } from '@/pages/ProjectCategories/List/CategoryListPanels';
import { useCategoryListController } from '@/pages/ProjectCategories/List/useCategoryListController';
import { useProjectCategoriesList } from '@/pages/ProjectCategories/List/useProjectCategoriesList';

import '@/pages/ProjectCategories/List/ListPage.scss';

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const permissions = useProjectPermissions(projectId);
    const { categories, categoriesQuery, selectedCategory, selectedCategoryId, setSelectedCategoryId } =
        useProjectCategoriesList(projectId);
    const controller = useCategoryListController({
        projectId,
        navigate,
        setSelectedCategoryId,
        canManageRequirements: permissions.canManageRequirements,
    });

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
                ref={controller.contextMenuRef}
                model={controller.contextMenuItems}
            />
            <CategoryDeleteDialog
                category={controller.deleteCategoryCandidate}
                pending={controller.deletePending}
                onAbort={controller.abortDeleteCategory}
                onConfirm={() => {
                    void controller.confirmDeleteCategory();
                }}
            />

            <CategoryListPanels
                categories={categories}
                categoriesQuery={categoriesQuery}
                selectedCategory={selectedCategory}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
                controller={controller}
                canManageRequirements={permissions.canManageRequirements}
            />
        </section>
    );
}
