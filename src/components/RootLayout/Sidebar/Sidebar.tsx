import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { queryClient } from '@/api/queryClient';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { ProjectDialog } from '@/components/RootLayout/Sidebar/ProjectDialog';
import { ProjectNavigationList } from '@/components/RootLayout/Sidebar/ProjectNavigationList';
import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';
import { useActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';
import { useProjectContextMenu } from '@/components/RootLayout/Sidebar/useProjectContextMenu';
import { useProjectDialogController } from '@/components/RootLayout/Sidebar/useProjectDialogController';
import { useProjectNavigation } from '@/components/RootLayout/Sidebar/useProjectNavigation';
import { useSidebarProjects } from '@/components/RootLayout/Sidebar/useSidebarProjects';
import { useRouteUiMetadata } from '@/router/routeUiMetadata';
import { useIsAdministrator } from '@/auth/projectPermissions';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

export function Sidebar() {
    const activeProjectRoute = useActiveProjectRoute();
    const projectDialog = useProjectDialogController();
    const projectNavigation = useProjectNavigation(activeProjectRoute);
    const routeUiMetadata = useRouteUiMetadata();
    const isAdministrator = useIsAdministrator();

    const projectsWithRequirementCounts = useSidebarProjects();

    const projectContextMenu = useProjectContextMenu(projectsWithRequirementCounts);

    function handleSynchronizeProjects(): void {
        void queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    }

    function handleRenameProject(): void {
        if (projectContextMenu.contextMenuProject === undefined) {
            return;
        }

        projectDialog.openRenameProjectDialog(projectContextMenu.contextMenuProject);
    }

    function handleDeleteProject(): void {
        if (projectContextMenu.contextMenuProject === undefined) {
            return;
        }

        // TODO: delete projectContextMenu.contextMenuProject.
    }

    function handleExportProject(): void {
        if (projectContextMenu.contextMenuProject === undefined) {
            return;
        }

        // TODO: export projectContextMenu.contextMenuProject.
    }

    function handleExportAllProjects(): void {
        // TODO: export all projects.
    }

    return (
        <aside
            className='sidebar'
            aria-label='Projects'>
            <SidebarContextMenu
                contextMenuRef={projectContextMenu.contextMenuRef}
                canAdministerProjects={isAdministrator}
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
                    disabled={routeUiMetadata.disableChromeActions}
                    showNewProject={isAdministrator}
                    onNewProject={projectDialog.openCreateProjectDialog}
                    onSynchronize={handleSynchronizeProjects}
                />
            </div>

            <ProjectNavigationList
                projects={projectsWithRequirementCounts}
                activeProjectRoute={activeProjectRoute}
                expandedProjectId={projectNavigation.expandedProjectId}
                onToggleProject={projectNavigation.toggleProject}
                onOpenProjectSubItem={projectNavigation.openProjectSubItem}
                onProjectContextMenu={projectContextMenu.openProjectContextMenu}
            />

            <ProjectDialog
                visible={projectDialog.visible}
                mode={projectDialog.mode}
                initialName={projectDialog.initialName}
                pending={projectDialog.pending}
                errorMessage={projectDialog.errorMessage}
                onCancel={projectDialog.cancelProjectDialog}
                onSubmit={projectDialog.submitProjectDialog}
            />
        </aside>
    );
}
