import { useLiveQuery } from '@tanstack/react-db';
import { useEffect, useMemo, useState } from 'react';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';

import type { CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';

export function useProjectCategoriesList(projectId: string | undefined) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

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

    const categories = useMemo<CategoryTableRow[]>(
        () =>
            (categoriesQuery.data ?? []).map((category) => ({
                ...category,
                requirementCount: category.requirementCount ?? 0,
            })),
        [categoriesQuery.data],
    );

    const selectedCategory = useMemo<CategoryTableRow | undefined>(
        () => categories.find((category) => category.id === selectedCategoryId) ?? categories[0],
        [categories, selectedCategoryId],
    );

    useEffect(() => {
        if (categories.length === 0) {
            setSelectedCategoryId(undefined);

            return;
        }

        setSelectedCategoryId((currentSelectedCategoryId) => {
            const selectedCategoryStillExists = categories.some(
                (category) => category.id === currentSelectedCategoryId,
            );

            return selectedCategoryStillExists ? currentSelectedCategoryId : categories[0].id;
        });
    }, [categories]);

    return { categories, categoriesQuery, selectedCategory, selectedCategoryId, setSelectedCategoryId };
}
