import type { CreateProjectInput, DemoProjectRepository, ProjectSummary } from '@/demo/demoTypes';

/** Snapshot shape for future project store subscriptions. */
export interface ProjectsStoreState {
    projects: readonly ProjectSummary[];
    loading: boolean;
    error: string | null;
}

/** Creates project data operations backed by the replaceable demo repository boundary. */
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
