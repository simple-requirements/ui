import { z } from 'zod';

import { listProjects } from '@/api/generated/projects/projects';

export const projectSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    requirementCount: z.number().int().nonnegative().optional(),
    ticketUrlTemplate: z
        .string()
        .nullable()
        .optional()
        .transform((value) => value ?? null),
});

export type Project = z.infer<typeof projectSchema>;

const projectsResponseSchema = z.array(projectSchema);

export async function listProjectsRequest(): Promise<Project[]> {
    const response = await listProjects();

    return projectsResponseSchema.parse(response.data);
}
