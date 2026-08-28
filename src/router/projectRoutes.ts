import { matchPath } from 'react-router';

export type ProjectSubRoute = 'requirements' | 'categories';

export function getProjectRoute(projectId: string): string {
    return `/projects/${projectId}`;
}

export function getProjectRequirementsRoute(projectId: string): string {
    return `/projects/${projectId}/requirements`;
}

export function getProjectRequirementDetailsRoute(projectId: string, requirementId: string): string {
    return `/projects/${projectId}/requirements/${requirementId}`;
}

export function getProjectRequirementEditRoute(projectId: string, requirementId: string): string {
    return `/projects/${projectId}/requirements/${requirementId}/edit`;
}

export function getProjectRequirementReviewRoute(projectId: string, requirementId: string): string {
    return `/projects/${projectId}/requirements/${requirementId}/review`;
}

export function getProjectRequirementCreateRoute(projectId: string, categoryId?: string): string {
    const route = `/projects/${projectId}/requirements/new`;

    return categoryId === undefined ? route : `${route}?categoryId=${encodeURIComponent(categoryId)}`;
}

export function getProjectCategoriesRoute(projectId: string): string {
    return `/projects/${projectId}/categories`;
}

export function getProjectCategoryCreateRoute(projectId: string): string {
    return `/projects/${projectId}/categories/new`;
}

export function getProjectCategoryDetailsRoute(projectId: string, categoryId: string): string {
    return `/projects/${projectId}/categories/${categoryId}`;
}

export function getProjectCategoryEditRoute(projectId: string, categoryId: string): string {
    return `/projects/${projectId}/categories/${categoryId}/edit`;
}

export function getProjectCategoryDetailsCloseRoute(route: string): string | undefined {
    const match =
        matchPath('/projects/:projectId/categories/new', route) ??
        matchPath('/projects/:projectId/categories/:categoryId/edit', route) ??
        matchPath('/projects/:projectId/categories/:categoryId', route);

    return match?.params.projectId === undefined ? undefined : getProjectCategoriesRoute(match.params.projectId);
}

export function getProjectRequirementDetailsCloseRoute(route: string): string | undefined {
    const match =
        matchPath('/projects/:projectId/requirements/new', route) ??
        matchPath('/projects/:projectId/requirements/:requirementId/edit', route) ??
        matchPath('/projects/:projectId/requirements/:requirementId/review', route) ??
        matchPath('/projects/:projectId/requirements/:requirementId', route);

    return match?.params.projectId === undefined ? undefined : getProjectRequirementsRoute(match.params.projectId);
}

export function getProjectDetailsCloseRoute(route: string): string | undefined {
    return getProjectCategoryDetailsCloseRoute(route) ?? getProjectRequirementDetailsCloseRoute(route);
}
