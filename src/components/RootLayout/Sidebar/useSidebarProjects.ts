import { useLiveQuery } from '@tanstack/react-db';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { projectsCollection, type SidebarProject } from '@/api/collections/projectsCollection';
import { getListProjectRequirementsQueryKey, listProjectRequirementsRequest } from '@/api/requirementsApi';

export function useSidebarProjects(): readonly SidebarProject[] {
    const { data: projects } = useLiveQuery((query) => query.from({ projects: projectsCollection }));
    const sortedProjects = useMemo(
        () => [...projects].sort((left, right) => left.name.localeCompare(right.name)),
        [projects],
    );
    const requirementCountQueries = useQueries({
        queries: sortedProjects.map((project) => ({
            queryKey: getListProjectRequirementsQueryKey(project.id),
            queryFn: () => listProjectRequirementsRequest(project.id),
            retry: false,
            refetchOnWindowFocus: false,
        })),
    });

    return useMemo(
        () =>
            sortedProjects.map(
                (project, index): SidebarProject => ({
                    ...project,
                    requirementCount: requirementCountQueries[index]?.data?.length ?? project.requirementCount ?? 0,
                }),
            ),
        [sortedProjects, requirementCountQueries],
    );
}
