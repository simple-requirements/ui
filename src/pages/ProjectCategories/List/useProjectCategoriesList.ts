import { useLiveQuery } from '@tanstack/react-db';
import { useEffect, useMemo, useState } from 'react';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import type { Requirement } from '@/api/requirementsApi';

import type { CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';

function isRequirement(value: unknown): value is Requirement {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'id' in value && 'categoryId' in value && 'visibleKey' in value;
}

function getRequirementCountByCategory(requirements: readonly unknown[] | undefined): ReadonlyMap<string, number> {
    const counts = new Map<string, number>();

    for (const requirement of requirements ?? []) {
        if (!isRequirement(requirement)) {
            continue;
        }

        counts.set(requirement.categoryId, (counts.get(requirement.categoryId) ?? 0) + 1);
    }

    return counts;
}

function getCategoryRequirementCount(categoryId: string, countByCategory: ReadonlyMap<string, number>, fallback: unknown): number {
    const count = countByCategory.get(categoryId);

    if (count !== undefined) {
        return count;
    }

    return typeof fallback === 'number' && Number.isFinite(fallback) ? fallback : 0;
}

export function useProjectCategoriesList(projectId: string | undefined) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );
    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
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

    const requirementsQuery = useLiveQuery(
        (query) => {
            if (requirementsCollection === undefined) {
                return undefined;
            }

            return query.from({ requirements: requirementsCollection });
        },
        [requirementsCollection],
    );

    const requirementCountByCategory = useMemo(
        () => getRequirementCountByCategory(requirementsQuery.data),
        [requirementsQuery.data],
    );

    const categories = useMemo<CategoryTableRow[]>(
        () =>
            (categoriesQuery.data ?? []).map((category) => ({
                ...category,
                requirementCount: getCategoryRequirementCount(
                    category.id,
                    requirementCountByCategory,
                    'requirementCount' in category ? category.requirementCount : undefined,
                ),
            })),
        [categoriesQuery.data, requirementCountByCategory],
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

    return { categories, categoriesQuery, requirementsQuery, selectedCategory, selectedCategoryId, setSelectedCategoryId };
}
