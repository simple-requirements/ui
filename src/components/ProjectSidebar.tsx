import { Button } from 'primereact/button';
import { ProjectRow } from '@/features/projects/ProjectRow';
import type { ProjectSummary } from '@/demo/demoTypes';
import type { Action } from '@/state/workspaceReducer';

type ProjectSidebarProps = Readonly<{
    projects: readonly ProjectSummary[];
    activeProjectId: string | null;
    dispatch: (action: Action) => void;
}>;

/** Displays project creation affordance and selectable project rows. */
export function ProjectSidebar({ projects, activeProjectId, dispatch }: ProjectSidebarProps) {
    return (
        <aside className='sidebar'>
            <Button
                type='button'
                className='new-project'
                onClick={() => dispatch({ type: 'setMode', mode: 'newProject' })}>
                New Project
            </Button>
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
