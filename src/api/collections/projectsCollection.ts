import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { z } from 'zod';

import { queryClient } from '@/api/queryClient';
import { getListProjectsQueryKey, listProjects } from '@/api/generated/projects/projects';

const apiProjectSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    requirementCount: z.number().int().nonnegative().default(0),
});

export type SidebarProject = z.infer<typeof apiProjectSchema>;

const projectsResponseSchema = z.array(apiProjectSchema);

export const projectsCollection = createCollection(
    queryCollectionOptions({
        id: 'projects',
        queryKey: getListProjectsQueryKey(),
        queryClient,
        getKey: (project) => project.id,
        schema: apiProjectSchema,

        queryFn: async () => {
            const response = await listProjects();

            return projectsResponseSchema.parse(response.data);
        },
    }),
);
