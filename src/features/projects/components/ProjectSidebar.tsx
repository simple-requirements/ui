import { useRef, useState, type MouseEvent } from 'react';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import { ProjectRow } from '@/features/projects/components/ProjectRow';
import type { ProjectSummary } from '@/types/domain';
import type { Action } from '@/state/workspaceReducer';

type ProjectSidebarProps = Readonly<{
    projects: readonly ProjectSummary[];
    activeProjectId: string | null;
    dispatch: (action: Action) => void;
    onExportProject: (project: ProjectSummary) => void;
    onExportAllProjects: () => void;
}>;

/** Displays project creation affordance and selectable project rows. */
export function ProjectSidebar({
    projects,
    activeProjectId,
    dispatch,
    onExportProject,
    onExportAllProjects,
}: ProjectSidebarProps) {
    const contextMenu = useRef<ContextMenu>(null);
    const [contextProject, setContextProject] = useState<ProjectSummary | null>(null);

    const menuItems: MenuItem[] = [
        {
            label: 'Export project',
            icon: 'pi pi-download',
            disabled: !contextProject,
            command: () => {
                if (contextProject) onExportProject(contextProject);
            },
        },
        { label: 'Export all projects', icon: 'pi pi-database', command: onExportAllProjects },
    ];

    const openProjectContextMenu = (event: MouseEvent<HTMLButtonElement>, project: ProjectSummary) => {
        setContextProject(project);
        contextMenu.current?.show(event);
    };

    return (
        <aside className='sidebar'>
            <ContextMenu
                model={menuItems}
                ref={contextMenu}
            />
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
                        onContextMenu={(event) => openProjectContextMenu(event, project)}
                    />
                ))}
            </div>
        </aside>
    );
}
