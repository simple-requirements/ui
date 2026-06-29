import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';

import { queryClient } from '@/api/queryClient';
import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { listProjectsRequest, projectSchema, type Project } from '@/api/projectsApi';

export type SidebarProject = Project;

export const projectsCollection = createCollection(
    queryCollectionOptions({
        id: 'projects',
        queryKey: getListProjectsQueryKey(),
        queryClient,
        getKey: (project) => project.id,
        schema: projectSchema,
        queryFn: listProjectsRequest,
    }),
);
