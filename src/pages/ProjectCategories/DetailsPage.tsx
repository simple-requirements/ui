import { eq, useLiveQuery } from '@tanstack/react-db';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectCategoryDetailsRoute, getProjectCategoryEditRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';

import { CategoryDetailsPanel } from '@/pages/ProjectCategories/CategoryDetailsPanel';

import '@/pages/ProjectCategories/DetailsPage.scss';

export function DetailsPage() {
    const { projectId, categoryId } = useParams();
    const navigate = useNavigate();

    const categoryDetailsRoute =
        projectId === undefined || categoryId === undefined ?
            undefined
        :   getProjectCategoryDetailsRoute(projectId, categoryId);

    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );

    const categoryQuery = useLiveQuery(
        (query) => {
            if (categoriesCollection === undefined || categoryId === undefined) {
                return undefined;
            }

            return query
                .from({ categories: categoriesCollection })
                .where(({ categories }) => eq(categories.id, categoryId))
                .findOne();
        },
        [categoriesCollection, categoryId],
    );

    const category = categoryQuery.data;

    useEffect(() => {
        if (category === undefined || categoryDetailsRoute === undefined) {
            return;
        }

        openTab({ id: categoryDetailsRoute, label: `Category ${category.key}`, closable: true });
    }, [category, categoryDetailsRoute]);

    function handleEditCategory(): void {
        if (projectId === undefined || category === undefined) {
            return;
        }

        const categoryDetailsRoute = getProjectCategoryDetailsRoute(projectId, category.id);
        const categoryEditRoute = getProjectCategoryEditRoute(projectId, category.id);

        openTab({ id: categoryDetailsRoute, label: `Category ${category.key}`, closable: true });
        void navigate(categoryEditRoute);
    }

    if (projectId === undefined || categoryId === undefined) {
        return (
            <section className='project-categories-details-page'>
                <InlineStatus kind='error'>Category route is incomplete.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-categories-details-page'
            aria-labelledby='project-categories-details-page-title'>
            <LoadableContent
                loading={categoryQuery.isLoading}
                error={categoryQuery.isError}
                empty={category === undefined}
                loadingMessage='Loading category …'
                errorMessage='Category could not be loaded.'
                emptyMessage='Category could not be found in the project categories list.'>
                <CategoryDetailsPanel
                    category={category}
                    title={category === undefined ? 'Category details' : `Category ${category.key}`}
                    titleElement='h1'
                    titleId='project-categories-details-page-title'
                    onEditCategory={handleEditCategory}
                />
            </LoadableContent>
        </section>
    );
}
