import { eq, useLiveQuery } from '@tanstack/react-db';
import { useMemo } from 'react';

import type { Category } from '@/api/categoriesApi';
import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';

import type { RequirementFormData } from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export function useRequirementFormData(
    projectId: string | undefined,
    requirementId: string | undefined,
): RequirementFormData {
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

    const requirementQuery = useLiveQuery(
        (query) => {
            if (requirementsCollection === undefined || requirementId === undefined) {
                return undefined;
            }

            return query
                .from({ requirements: requirementsCollection })
                .where(({ requirements }) => eq(requirements.id, requirementId))
                .findOne();
        },
        [requirementsCollection, requirementId],
    );

    const categories = useMemo<readonly Category[]>(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

    return {
        categories,
        requirement: requirementQuery.data,
        loading: categoriesQuery.isLoading || (requirementId !== undefined && requirementQuery.isLoading),
        error: categoriesQuery.isError || (requirementId !== undefined && requirementQuery.isError),
    };
}
