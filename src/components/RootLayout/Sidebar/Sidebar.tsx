import { getListProjectsQueryKey } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { ProjectNavigationList } from '@/components/RootLayout/Sidebar/ProjectNavigationList';
import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';
import { useActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';
import { useProjectContextMenu } from '@/components/RootLayout/Sidebar/useProjectContextMenu';
import { useProjectNavigation } from '@/components/RootLayout/Sidebar/useProjectNavigation';
import { useSidebarProjects } from '@/components/RootLayout/Sidebar/useSidebarProjects';
import { useRouteUiMetadata } from '@/router/routeUiMetadata';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

export function Sidebar() {
    const activeProjectRoute = useActiveProjectRoute();
    const projectNavigation = useProjectNavigation(activeProjectRoute);
    const routeUiMetadata = useRouteUiMetadata();
    const projectsWithRequirementCounts = useSidebarProjects();
    const projectContextMenu = useProjectContextMenu(projectsWithRequirementCounts);

    function handleSynchronizeProjects(): void {
        void queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
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
                onExportProject={handleExportProject}
                onExportAllProjects={handleExportAllProjects}
            />

            <div
                className='sidebar__actions'
                role='group'
                aria-label='Project actions'>
                <ActionButton
                    disabled={routeUiMetadata.disableChromeActions}
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
                onProjectIntent={projectNavigation.prefetchProjectRoute}
            />
        </aside>
    );
}
