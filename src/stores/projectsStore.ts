import { createSimpleStore } from '@/stores/simpleStore';
import type { CreateProjectInput, DemoProjectRepository, ProjectSummary } from '@/demo/demoTypes';

/** Snapshot shape for project store subscriptions. */
export interface ProjectsStoreState {
    projects: readonly ProjectSummary[];
    loading: boolean;
    error: string | null;
}

/** Creates project data operations backed by a TanStack-style store and the replaceable demo repository boundary. */
export function createProjectsStore(projectRepository: DemoProjectRepository) {
    const store = createSimpleStore<ProjectsStoreState>({ projects: [], loading: false, error: null });

    return {
        store,
        async loadProjects() {
            store.setState((currentState) => ({ ...currentState, loading: true, error: null }));
            try {
                const projects = [...(await projectRepository.listProjects())];
                store.setState(() => ({ projects, loading: false, error: null }));
                return projects;
            } catch (error) {
                store.setState((currentState) => ({
                    ...currentState,
                    loading: false,
                    error: (error as Error).message,
                }));
                throw error;
            }
        },
        async createProject(input: CreateProjectInput) {
            return projectRepository.createProject(input);
        },
    };
}
