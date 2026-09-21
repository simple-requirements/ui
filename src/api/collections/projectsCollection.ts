import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection } from '@tanstack/react-db';

import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { listProjectsRequest, projectSchema, type Project } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';

export type SidebarProject = Project & Readonly<{ requirementCount: number }>;

function createProjectsCollection() {
    return createCollection(
        queryCollectionOptions({
            id: 'projects',
            queryKey: getListProjectsQueryKey(),
            queryClient,
            getKey: (project) => project.id,
            schema: projectSchema,
            queryFn: listProjectsRequest,
        }),
    );
}

export let projectsCollection = createProjectsCollection();

/** Clears user-scoped project rows and prepares a fresh collection for the next authenticated session. */
export async function resetProjectsCollection(): Promise<void> {
    await projectsCollection.cleanup();
    projectsCollection = createProjectsCollection();
}
