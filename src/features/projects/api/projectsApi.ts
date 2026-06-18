import type { ProjectSummary } from '@/types/domain';

export function listProjects(): Promise<ProjectSummary[]> {
    return Promise.reject(
        new Error(
            'Backend contract gap: openapi/backend-api.json does not expose GET /projects or project requirement counts.',
        ),
    );
}
