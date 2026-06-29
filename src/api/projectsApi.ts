import { createProject, updateProject } from '@/api/generated/projects/projects';

export type ProjectNameRequest = Readonly<{ name: string }>;

export async function createProjectRequest(data: ProjectNameRequest): Promise<void> {
    await createProject(data);
}

export async function updateProjectRequest(projectId: string, data: ProjectNameRequest): Promise<void> {
    await updateProject(projectId, data);
}
