import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
    prefetchProjectCategories,
    prefetchProjectDetails,
    prefetchProjectRequirements,
} from '@/api/projectPrefetch';
import {
    getProjectRoute,
    type ActiveProjectRoute,
    type ProjectSubRoute,
} from '@/router/projectRoutes';
import {
    preloadProjectCategoriesListRoute,
    preloadProjectDetailsRoute,
    preloadProjectRequirementsListRoute,
} from '@/router/routeModules';

export type ProjectNavigationController = Readonly<{
    expandedProjectId: string | undefined;
    toggleProject: (projectId: string) => void;
    openProjectSubItem: (projectId: string) => void;
    prefetchProjectRoute: (projectId: string, subRoute?: ProjectSubRoute) => void;
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

    function prefetchProjectRoute(projectId: string, subRoute?: ProjectSubRoute): void {
        if (subRoute === 'requirements') {
            preloadProjectRequirementsListRoute();
            void prefetchProjectRequirements(projectId);
            return;
        }

        if (subRoute === 'categories') {
            preloadProjectCategoriesListRoute();
            void prefetchProjectCategories(projectId);
            return;
        }

        preloadProjectDetailsRoute();
        void prefetchProjectDetails(projectId);
    }

    return { expandedProjectId, toggleProject, openProjectSubItem, prefetchProjectRoute };
}
