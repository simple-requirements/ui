import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { getProjectRoute } from '@/router/projectRoutes';

import type { ActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';

export type ProjectNavigationController = Readonly<{
    expandedProjectId: string | undefined;
    toggleProject: (projectId: string) => void;
    openProjectSubItem: (projectId: string) => void;
}>;

export function useProjectNavigation(activeProjectRoute: ActiveProjectRoute): ProjectNavigationController {
    const navigate = useNavigate();
    const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>(() => activeProjectRoute.projectId);

    useEffect(() => {
        setExpandedProjectId(activeProjectRoute.projectId);
    }, [activeProjectRoute.projectId]);

    function toggleProject(projectId: string): void {
        setExpandedProjectId((currentExpandedProjectId) =>
            currentExpandedProjectId === projectId ? undefined : projectId,
        );
        void navigate(getProjectRoute(projectId));
    }

    function openProjectSubItem(projectId: string): void {
        setExpandedProjectId(projectId);
    }

    return { expandedProjectId, toggleProject, openProjectSubItem };
}
