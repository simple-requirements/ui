import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';

import { categorySchema, getListProjectCategoriesQueryKey, listProjectCategoriesRequest } from '@/api/categoriesApi';
import { queryClient } from '@/api/queryClient';

function createProjectCategoriesCollection(projectId: string) {
    return createCollection(
        queryCollectionOptions({
            id: `project-categories:${projectId}`,
            queryKey: getListProjectCategoriesQueryKey(projectId),
            queryClient,
            getKey: (category) => category.id,
            schema: categorySchema,
            queryFn: () => listProjectCategoriesRequest(projectId),
            retry: false,
        }),
    );
}

export type ProjectCategoriesCollection = ReturnType<typeof createProjectCategoriesCollection>;

const projectCategoriesCollections = new Map<string, ProjectCategoriesCollection>();

export function getProjectCategoriesCollection(projectId: string): ProjectCategoriesCollection {
    const existingCollection = projectCategoriesCollections.get(projectId);

    if (existingCollection !== undefined) {
        return existingCollection;
    }

    const collection = createProjectCategoriesCollection(projectId);

    projectCategoriesCollections.set(projectId, collection);

    return collection;
}
