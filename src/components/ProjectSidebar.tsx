import { ProjectRow } from '@/features/projects/ProjectRow';
import type { ProjectSummary } from '@/demo/demoTypes';
import type { Action } from '@/state/workspaceReducer';

interface ProjectSidebarProps {
    projects: readonly ProjectSummary[];
    activeProjectId: string | null;
    dispatch: (action: Action) => void;
}

export function ProjectSidebar({ projects, activeProjectId, dispatch }: ProjectSidebarProps) {
    return (
        <aside className="sidebar">
            <button className="new-project" onClick={() => dispatch({ type: 'setMode', mode: 'newProject' })}>
                New Project
            </button>
            <div>
                {projects.map((project) => (
                    <ProjectRow
                        key={project.id}
                        project={project}
                        active={project.id === activeProjectId}
                        onSelect={() => dispatch({ type: 'selectProject', projectId: project.id })}
                    />
                ))}
            </div>
        </aside>
    );
}
