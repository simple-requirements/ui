import { useLiveQuery } from '@tanstack/react-db';
import { useMutation } from '@tanstack/react-query';
import type { ContextMenu } from 'primereact/contextmenu';
import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';

import { projectsCollection, type SidebarProject } from '@/api/collections/projectsCollection';
import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { createProjectRequest, updateProjectRequest } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';
import { ExpandableNavigationItem } from '@/components/Navigation/ExpandableNavigationItem';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { ProjectDialog, type ProjectDialogSubmitData } from '@/components/RootLayout/Sidebar/ProjectDialog';
import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';
import {
    getProjectCategoriesRoute,
    getProjectRequirementsRoute,
    getProjectRoute,
    type ProjectSubRoute,
} from '@/router/projectRoutes';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

type ProjectDialogState = Readonly<{ mode: 'create' }> | Readonly<{ mode: 'rename'; project: SidebarProject }>;

type UpdateProjectMutationVariables = Readonly<{ projectId: string; formData: ProjectDialogSubmitData }>;

type ActiveProjectRoute = Readonly<{ projectId?: string; subRoute?: ProjectSubRoute }>;

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'The project could not be saved.';
}

function getActiveProjectRoute(pathname: string): ActiveProjectRoute {
    const requirementsRouteMatch = matchPath('/projects/:projectId/requirements', pathname);

    if (requirementsRouteMatch?.params.projectId !== undefined) {
        return { projectId: requirementsRouteMatch.params.projectId, subRoute: 'requirements' };
    }

    const categoriesRouteMatch = matchPath('/projects/:projectId/categories', pathname);

    if (categoriesRouteMatch?.params.projectId !== undefined) {
        return { projectId: categoriesRouteMatch.params.projectId, subRoute: 'categories' };
    }

    const projectRouteMatch = matchPath('/projects/:projectId', pathname);

    if (projectRouteMatch?.params.projectId !== undefined) {
        return { projectId: projectRouteMatch.params.projectId };
    }

    return {};
}

export function Sidebar() {
    const contextMenuRef = useRef<ContextMenu | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const activeProjectRoute = getActiveProjectRoute(location.pathname);

    const [projectDialogState, setProjectDialogState] = useState<ProjectDialogState>();
    const [contextMenuProjectId, setContextMenuProjectId] = useState<string>();
    const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>(() =>
        activeProjectRoute.subRoute === undefined ? undefined : activeProjectRoute.projectId,
    );

    const { data: projects } = useLiveQuery((query) => query.from({ projects: projectsCollection }));

    const createProjectMutation = useMutation({
        mutationFn: async (formData: ProjectDialogSubmitData): Promise<void> => {
            await createProjectRequest({ name: formData.name });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            setProjectDialogState(undefined);
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: async ({ projectId, formData }: UpdateProjectMutationVariables): Promise<void> => {
            await updateProjectRequest(projectId, { name: formData.name });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            setProjectDialogState(undefined);
        },
    });

    const sortedProjects = [...projects].sort((left, right) => left.name.localeCompare(right.name));

    const projectDialogVisible = projectDialogState !== undefined;
    const projectDialogMode = projectDialogState?.mode ?? 'create';
    const projectDialogInitialName = projectDialogState?.mode === 'rename' ? projectDialogState.project.name : '';
    const projectDialogPending =
        projectDialogState?.mode === 'rename' ? updateProjectMutation.isPending : createProjectMutation.isPending;
    const projectDialogError =
        projectDialogState?.mode === 'rename' ? updateProjectMutation.error : createProjectMutation.error;
    const projectDialogErrorMessage = projectDialogError === null ? undefined : getErrorMessage(projectDialogError);

    useEffect(() => {
        if (activeProjectRoute.projectId === undefined) {
            return;
        }

        if (activeProjectRoute.subRoute === undefined) {
            setExpandedProjectId(undefined);

            return;
        }

        setExpandedProjectId(activeProjectRoute.projectId);
    }, [activeProjectRoute.projectId, activeProjectRoute.subRoute]);

    function getContextMenuProject(): SidebarProject | undefined {
        return sortedProjects.find((project) => project.id === contextMenuProjectId);
    }

    function resetProjectDialogMutations(): void {
        createProjectMutation.reset();
        updateProjectMutation.reset();
    }

    async function handleSubmitProjectDialog(formData: ProjectDialogSubmitData): Promise<void> {
        if (projectDialogState?.mode === 'rename') {
            await updateProjectMutation.mutateAsync({ projectId: projectDialogState.project.id, formData });

            return;
        }

        await createProjectMutation.mutateAsync(formData);
    }

    function handleOpenProjectDialog(): void {
        resetProjectDialogMutations();
        setProjectDialogState({ mode: 'create' });
    }

    function handleCancelProjectDialog(): void {
        if (createProjectMutation.isPending || updateProjectMutation.isPending) {
            return;
        }

        resetProjectDialogMutations();
        setProjectDialogState(undefined);
    }

    function handleSynchronizeProjects(): void {
        void queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    }

    function handleToggleProject(projectId: string): void {
        if (expandedProjectId === projectId) {
            setExpandedProjectId(undefined);
            void navigate(getProjectRoute(projectId));

            return;
        }

        setExpandedProjectId(projectId);
        void navigate(getProjectRequirementsRoute(projectId));
    }

    function handleOpenProjectSubItem(projectId: string): void {
        setExpandedProjectId(projectId);
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

        resetProjectDialogMutations();

        setProjectDialogState({ mode: 'rename', project: contextMenuProject });
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
                {sortedProjects.length === 0 && <p className='sidebar__status'>No projects available.</p>}

                {sortedProjects.length > 0 && (
                    <ul className='sidebar__project-list'>
                        {sortedProjects.map((project) => (
                            <ExpandableNavigationItem
                                key={project.id}
                                label={project.name}
                                badgeValue={project.requirementCount}
                                expanded={project.id === expandedProjectId}
                                active={
                                    project.id === activeProjectRoute.projectId
                                    && activeProjectRoute.subRoute === undefined
                                }
                                subItems={[
                                    {
                                        id: 'requirements',
                                        label: 'Requirements',
                                        to: getProjectRequirementsRoute(project.id),
                                        iconClassName: 'pi pi-list',
                                    },
                                    {
                                        id: 'categories',
                                        label: 'Categories',
                                        to: getProjectCategoriesRoute(project.id),
                                        iconClassName: 'pi pi-tags',
                                    },
                                ]}
                                onToggle={() => handleToggleProject(project.id)}
                                onSubItemClick={() => handleOpenProjectSubItem(project.id)}
                                onContextMenu={(event) => handleProjectContextMenu(project.id, event)}
                            />
                        ))}
                    </ul>
                )}
            </nav>

            <ProjectDialog
                visible={projectDialogVisible}
                mode={projectDialogMode}
                initialName={projectDialogInitialName}
                pending={projectDialogPending}
                errorMessage={projectDialogErrorMessage}
                onCancel={handleCancelProjectDialog}
                onSubmit={handleSubmitProjectDialog}
            />
        </aside>
    );
}
