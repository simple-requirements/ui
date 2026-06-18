import type { ProjectSummary } from '@/types/domain';

export type ProjectAvailability =
    | { state: 'none'; activeProject: null; canUseProject: false; message: 'Select a project to continue.' }
    | { state: 'loading'; activeProject: null; canUseProject: false; message: 'Loading project…' }
    | { state: 'available'; activeProject: ProjectSummary; canUseProject: true; message: null }
    | {
          state: 'unavailable';
          activeProject: null;
          canUseProject: false;
          message: 'The selected project is not available.';
      };

/** Derives project-scoped action availability from only the active route id and loaded project records. */
export function deriveProjectAvailability(
    activeProjectId: string | null,
    projects: readonly ProjectSummary[],
    projectsLoading: boolean,
): ProjectAvailability {
    if (!activeProjectId) {
        return { state: 'none', activeProject: null, canUseProject: false, message: 'Select a project to continue.' };
    }

    const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
    if (activeProject) return { state: 'available', activeProject, canUseProject: true, message: null };

    if (projectsLoading)
        return { state: 'loading', activeProject: null, canUseProject: false, message: 'Loading project…' };

    return {
        state: 'unavailable',
        activeProject: null,
        canUseProject: false,
        message: 'The selected project is not available.',
    };
}
