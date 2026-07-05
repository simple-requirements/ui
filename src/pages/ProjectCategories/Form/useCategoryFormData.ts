import { eq, useLiveQuery } from '@tanstack/react-db';
import { useMemo } from 'react';

import type { Category } from '@/api/categoriesApi';
import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';

import type { CategoryFormData } from '@/pages/ProjectCategories/Form/categoryFormTypes';

export function useCategoryFormData(
    projectId: string | undefined,
    categoryId: string | undefined,
): CategoryFormData {
    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );

    const categoriesQuery = useLiveQuery(
        (query) => {
            if (categoriesCollection === undefined) {
                return undefined;
            }

            return query.from({ categories: categoriesCollection });
        },
        [categoriesCollection],
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

    const categories = useMemo<readonly Category[]>(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

    return {
        categories,
        category: categoryQuery.data,
        loading: categoryId !== undefined && categoryQuery.isLoading,
        error: categoryId !== undefined && categoryQuery.isError,
    };
}
