import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection } from '@tanstack/react-db';

import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { listProjectsRequest, projectSchema, type Project } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';

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
