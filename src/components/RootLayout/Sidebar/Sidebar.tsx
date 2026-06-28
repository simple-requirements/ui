import { useLiveQuery } from '@tanstack/react-db';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { projectsCollection } from '@/api/collections/projectsCollection';
import { createProject, getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { queryClient } from '@/api/queryClient';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { ProjectDialog, type ProjectDialogSubmitData } from '@/components/RootLayout/Sidebar/ProjectDialog';
import { SidebarEntry } from '@/components/RootLayout/Sidebar/SidebarEntry';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'The project could not be saved.';
}

export function Sidebar() {
    const [projectDialogVisible, setProjectDialogVisible] = useState(false);

    const {
        data: projects,
        isLoading,
        isError,
    } = useLiveQuery((query) => query.from({ projects: projectsCollection }));

    const createProjectMutation = useMutation({
        mutationFn: async (formData: ProjectDialogSubmitData) => createProject({ name: formData.name }),

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            setProjectDialogVisible(false);
        },
    });

    const sortedProjects = [...projects].sort((left, right) => left.name.localeCompare(right.name));

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

    return (
        <aside
            className='sidebar'
            aria-label='Projects'>
            <div
                className='sidebar__actions'
                role='group'
                aria-label='Project actions'>
                <ActionButton onNewProject={handleOpenProjectDialog} />
            </div>

            <nav
                className='sidebar__project-navigation'
                aria-label='Project list'>
                {isLoading && <p className='sidebar__status'>Loading projects …</p>}

                {isError && <p className='sidebar__status sidebar__status--error'>Projects could not be loaded.</p>}

                {!isLoading && !isError && sortedProjects.length === 0 && (
                    <p className='sidebar__status'>No projects available.</p>
                )}

                {!isLoading && !isError && sortedProjects.length > 0 && (
                    <ul className='sidebar__project-list'>
                        {sortedProjects.map((project, index) => (
                            <li key={project.id}>
                                <SidebarEntry
                                    projectName={project.name}
                                    requirementCount={project.requirementCount}
                                    selected={index === 0}
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
