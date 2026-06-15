import type { CreateProjectInput, DemoProjectRepository, ProjectSummary } from '@/demo/demoTypes';

export interface ProjectsStoreState {
    projects: readonly ProjectSummary[];
    loading: boolean;
    error: string | null;
}

export function createProjectsStore(projectRepository: DemoProjectRepository) {
    return {
        async loadProjects() {
            return [...(await projectRepository.listProjects())];
        },
        async createProject(input: CreateProjectInput) {
            return projectRepository.createProject(input);
        },
    };
}
