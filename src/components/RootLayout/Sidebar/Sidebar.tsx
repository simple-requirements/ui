import { useLiveQuery } from '@tanstack/react-db';
import { useMutation } from '@tanstack/react-query';
import type { ContextMenu } from 'primereact/contextmenu';
import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { projectsCollection } from '@/api/collections/projectsCollection';
import { createProject, getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { queryClient } from '@/api/queryClient';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { ProjectDialog, type ProjectDialogSubmitData } from '@/components/RootLayout/Sidebar/ProjectDialog';
import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';
import { SidebarEntry } from '@/components/RootLayout/Sidebar/SidebarEntry';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'The project could not be saved.';
}

export function Sidebar() {
    const contextMenuRef = useRef<ContextMenu | null>(null);

    const [projectDialogVisible, setProjectDialogVisible] = useState(false);
    const [contextMenuProjectId, setContextMenuProjectId] = useState<string>();

    const { data: projects, isLoading } = useLiveQuery((query) => query.from({ projects: projectsCollection }));

    const createProjectMutation = useMutation({
        mutationFn: async (formData: ProjectDialogSubmitData) => createProject({ name: formData.name }),

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            setProjectDialogVisible(false);
        },
    });

    const sortedProjects = [...projects].sort((left, right) => left.name.localeCompare(right.name));

    function getContextMenuProject() {
        return sortedProjects.find((project) => project.id === contextMenuProjectId);
    }

    async function handleCreateProject(formData: ProjectDialogSubmitData): Promise<void> {
        await createProjectMutation.mutateAsync(formData);
    }

    function handleOpenProjectDialog(): void {
        createProjectMutation.reset();
        setProjectDialogVisible(true);
    }

    function handleCancelProjectDialog(): void {
        if (createProjectMutation.isPending) {
            return;
        }

        createProjectMutation.reset();
        setProjectDialogVisible(false);
    }

    function handleSynchronizeProjects(): void {
        void queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    }

    function handleProjectContextMenu(projectId: string, event: MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();

        setContextMenuProjectId(projectId);
        contextMenuRef.current?.show(event);
    }

    function handleRenameProject(): void {
        const contextMenuProject = getContextMenuProject();

        if (contextMenuProject === undefined) {
            return;
        }

        // TODO: open rename dialog for contextMenuProject.
    }

    function handleDeleteProject(): void {
        const contextMenuProject = getContextMenuProject();

        if (contextMenuProject === undefined) {
            return;
        }

        // TODO: delete contextMenuProject.
    }

    function handleExportProject(): void {
        const contextMenuProject = getContextMenuProject();

        if (contextMenuProject === undefined) {
            return;
        }

        // TODO: export contextMenuProject.
    }

    function handleExportAllProjects(): void {
        // TODO: export all projects.
    }

    return (
        <aside
            className='sidebar'
            aria-label='Projects'>
            <SidebarContextMenu
                contextMenuRef={contextMenuRef}
                onRenameProject={handleRenameProject}
                onDeleteProject={handleDeleteProject}
                onExportProject={handleExportProject}
                onExportAllProjects={handleExportAllProjects}
            />

            <div
                className='sidebar__actions'
                role='group'
                aria-label='Project actions'>
                <ActionButton
                    onNewProject={handleOpenProjectDialog}
                    onSynchronize={handleSynchronizeProjects}
                />
            </div>

            <nav
                className='sidebar__project-navigation'
                aria-label='Project list'>
                {isLoading && <p className='sidebar__status'>Loading projects …</p>}

                {!isLoading && sortedProjects.length === 0 && <p className='sidebar__status'>No projects available.</p>}

                {!isLoading && sortedProjects.length > 0 && (
                    <ul className='sidebar__project-list'>
                        {sortedProjects.map((project, index) => (
                            <li key={project.id}>
                                <SidebarEntry
                                    projectName={project.name}
                                    requirementCount={project.requirementCount}
                                    selected={index === 0}
                                    onContextMenu={(event) => handleProjectContextMenu(project.id, event)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </nav>

            <ProjectDialog
                visible={projectDialogVisible}
                mode='create'
                pending={createProjectMutation.isPending}
                errorMessage={createProjectMutation.isError ? getErrorMessage(createProjectMutation.error) : undefined}
                onCancel={handleCancelProjectDialog}
                onSubmit={handleCreateProject}
            />
        </aside>
    );
}
