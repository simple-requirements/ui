import { runOrvalFetch } from '@/api/client/config';
import { getProjects, postProjects } from '@/api/generated/endpoints/projects/projects';
import type { ProjectResponseDto } from '@/api/generated/models';
import type { ProjectSummary } from '@/types/domain';

export const mapProject = (dto: ProjectResponseDto): ProjectSummary => ({
    id: dto.id,
    name: dto.name,
    requirementCount: dto.requirementCount,
});

export function listProjects(init?: RequestInit): Promise<ProjectSummary[]> {
    return runOrvalFetch(() => getProjects(init)).then((projects) => projects.map(mapProject));
}

export function createProject(name: string, init?: RequestInit): Promise<ProjectSummary> {
    return runOrvalFetch(() => postProjects({ name }, init)).then(mapProject);
}
