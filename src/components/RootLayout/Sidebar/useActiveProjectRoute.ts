import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router';

import type { ProjectSubRoute } from '@/router/projectRoutes';

export type ActiveProjectRoute = Readonly<{ projectId?: string; subRoute?: ProjectSubRoute }>;

export function getActiveProjectRoute(pathname: string): ActiveProjectRoute {
    const requirementsRouteMatch = matchPath('/projects/:projectId/requirements/*', pathname);

    if (requirementsRouteMatch?.params.projectId !== undefined) {
        return { projectId: requirementsRouteMatch.params.projectId, subRoute: 'requirements' };
    }

    const categoriesRouteMatch = matchPath('/projects/:projectId/categories/*', pathname);

    if (categoriesRouteMatch?.params.projectId !== undefined) {
        return { projectId: categoriesRouteMatch.params.projectId, subRoute: 'categories' };
    }

    const projectRouteMatch = matchPath('/projects/:projectId', pathname);

    if (projectRouteMatch?.params.projectId !== undefined) {
        return { projectId: projectRouteMatch.params.projectId };
    }

    return {};
}

export function useActiveProjectRoute(): ActiveProjectRoute {
    const location = useLocation();

    return useMemo(() => getActiveProjectRoute(location.pathname), [location.pathname]);
}
