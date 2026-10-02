import { useSelector } from '@tanstack/react-store';
import { useState } from 'react';

import { getListProjectsQueryKey } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { ProjectExportDialog } from '@/components/RootLayout/Sidebar/ProjectExportDialog';
import { ProjectNavigationList } from '@/components/RootLayout/Sidebar/ProjectNavigationList';
import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';
import { useActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';
import { useProjectContextMenu } from '@/components/RootLayout/Sidebar/useProjectContextMenu';
import { useProjectNavigation } from '@/components/RootLayout/Sidebar/useProjectNavigation';
import { useSidebarProjects } from '@/components/RootLayout/Sidebar/useSidebarProjects';
import { useRouteUiMetadata } from '@/router/routeUiMetadata';
import { authStore } from '@/stores/authStore';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

export function Sidebar() {
    const activeProjectRoute = useActiveProjectRoute();
    const projectNavigation = useProjectNavigation(activeProjectRoute);
    const routeUiMetadata = useRouteUiMetadata();
    const projectsWithRequirementCounts = useSidebarProjects();
    const projectContextMenu = useProjectContextMenu(projectsWithRequirementCounts);
    const canExportProjects = useSelector(authStore, (state) => state.user?.role === 'requirements_engineer');
    const [exportProjectId, setExportProjectId] = useState<string>();

    function handleSynchronizeProjects(): void {
        void queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    }

    function handleExportProject(): void {
        if (projectContextMenu.contextMenuProject === undefined || !canExportProjects) return;
        setExportProjectId(projectContextMenu.contextMenuProject.id);
    }

    const exportProject = projectsWithRequirementCounts.find((project) => project.id === exportProjectId);

    return (
        <aside
            className='sidebar'
            aria-label='Projects'>
            <SidebarContextMenu
                contextMenuRef={projectContextMenu.contextMenuRef}
                canExportProject={canExportProjects}
                onExportProject={handleExportProject}
            />

            <ProjectExportDialog
                visible={exportProjectId !== undefined}
                projectId={exportProjectId}
                projectName={exportProject?.name}
                onClose={() => setExportProjectId(undefined)}
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
