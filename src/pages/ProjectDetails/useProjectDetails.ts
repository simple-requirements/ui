import { eq, useLiveQuery } from '@tanstack/react-db';
import { useMemo } from 'react';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { projectsCollection } from '@/api/collections/projectsCollection';
import { type RequirementStatus, requirementStatusSchema } from '@/api/requirementsApi';

export const requirementStatuses = requirementStatusSchema.options;
export type RequirementStatusStatistics = Readonly<Record<RequirementStatus, number>>;

function createEmptyRequirementStatusStatistics(): RequirementStatusStatistics {
    return { draft: 0, approved: 0, implemented: 0, obsolete: 0, rejected: 0 };
}

export function useProjectDetails(projectId: string | undefined) {
    const projectQuery = useLiveQuery(
        (query) =>
            projectId === undefined ? undefined : (
                query
                    .from({ projects: projectsCollection })
                    .where(({ projects }) => eq(projects.id, projectId))
                    .findOne()
            ),
        [projectId],
    );
    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );
    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );
    const categoriesQuery = useLiveQuery(
        (query) => (categoriesCollection === undefined ? undefined : query.from({ categories: categoriesCollection })),
        [categoriesCollection],
    );
    const requirementsQuery = useLiveQuery(
        (query) =>
            requirementsCollection === undefined ? undefined : query.from({ requirements: requirementsCollection }),
        [requirementsCollection],
    );
    const categories = categoriesQuery.data ?? [];
    const requirements = requirementsQuery.data ?? [];
    const requirementStatusStatistics = useMemo(
        () =>
            requirements.reduce<RequirementStatusStatistics>(
                (statistics, requirement) => ({
                    ...statistics,
                    [requirement.status]: statistics[requirement.status] + 1,
                }),
                createEmptyRequirementStatusStatistics(),
            ),
        [requirements],
    );

    return {
        project: projectQuery.data,
        categoriesCount: categories.length,
        requirementsCount: requirements.length,
        requirementStatusStatistics,
        loading: projectQuery.isLoading || categoriesQuery.isLoading || requirementsQuery.isLoading,
        error: projectQuery.isError || categoriesQuery.isError || requirementsQuery.isError,
    };
}
