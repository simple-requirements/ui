import { useLiveQuery } from '@tanstack/react-db';
import { useMemo } from 'react';

import { projectsCollection, type SidebarProject } from '@/api/collections/projectsCollection';

/**
 * Returns backend-visible sidebar projects using the authoritative project requirement counts.
 * @returns Projects the backend already authorized for the current user.
 */
export function useSidebarProjects(): readonly SidebarProject[] {
    const { data: projects } = useLiveQuery((query) => query.from({ projects: projectsCollection }));

    return useMemo(
        () =>
            [...projects]
                .sort((left, right) => left.name.localeCompare(right.name))
                .map((project): SidebarProject => ({ ...project, requirementCount: project.requirementCount ?? 0 })),
        [projects],
    );
}
