import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';

import { queryClient } from '@/api/queryClient';
import {
    getListProjectRequirementsQueryKey,
    listProjectRequirementsRequest,
    requirementSchema,
} from '@/api/requirementsApi';

function createProjectRequirementsCollection(projectId: string) {
    return createCollection(
        queryCollectionOptions({
            id: `project-requirements:${projectId}`,
            queryKey: getListProjectRequirementsQueryKey(projectId),
            queryClient,
            getKey: (requirement) => requirement.id,
            schema: requirementSchema,
            queryFn: () => listProjectRequirementsRequest(projectId),
            retry: false,
        }),
    );
}

export type ProjectRequirementsCollection = ReturnType<typeof createProjectRequirementsCollection>;

const projectRequirementsCollections = new Map<string, ProjectRequirementsCollection>();

export function getProjectRequirementsCollection(projectId: string): ProjectRequirementsCollection {
    const existingCollection = projectRequirementsCollections.get(projectId);

    if (existingCollection !== undefined) {
        return existingCollection;
    }

    const collection = createProjectRequirementsCollection(projectId);

    projectRequirementsCollections.set(projectId, collection);

    return collection;
}
