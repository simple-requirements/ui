import { z } from 'zod';

import { createProject, listProjects, updateProject } from '@/api/generated/projects/projects';

export const projectSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    requirementCount: z.number().int().nonnegative().optional(),
});

export type Project = z.infer<typeof projectSchema>;

const projectsResponseSchema = z.array(projectSchema);

export type ProjectNameRequest = Readonly<{ name: string }>;

export async function listProjectsRequest(): Promise<Project[]> {
    const response = await listProjects();

    return projectsResponseSchema.parse(response.data);
}

export async function createProjectRequest(data: ProjectNameRequest): Promise<void> {
    await createProject(data);
}

export async function updateProjectRequest(projectId: string, data: ProjectNameRequest): Promise<void> {
    await updateProject(projectId, data);
}
