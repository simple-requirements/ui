import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { getProjectRequirementsRoute, getProjectRoute } from '@/router/projectRoutes';

import type { ActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';

export type ProjectNavigationController = Readonly<{
    expandedProjectId: string | undefined;
    toggleProject: (projectId: string) => void;
    openProjectSubItem: (projectId: string) => void;
}>;

export function useProjectNavigation(activeProjectRoute: ActiveProjectRoute): ProjectNavigationController {
    const navigate = useNavigate();
    const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>(() =>
        activeProjectRoute.subRoute === undefined ? undefined : activeProjectRoute.projectId,
    );

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

    function toggleProject(projectId: string): void {
        if (expandedProjectId === projectId) {
            setExpandedProjectId(undefined);
            void navigate(getProjectRoute(projectId));

            return;
        }

        setExpandedProjectId(projectId);
        void navigate(getProjectRequirementsRoute(projectId));
    }

    function openProjectSubItem(projectId: string): void {
        setExpandedProjectId(projectId);
    }

    return { expandedProjectId, toggleProject, openProjectSubItem };
}
