export type ProjectSubRoute = 'requirements' | 'categories';

const PROJECT_CATEGORY_DETAILS_ROUTE_PATTERN = /^\/projects\/([^/]+)\/categories\/[^/]+$/u;

export function getProjectRoute(projectId: string): string {
    return `/projects/${projectId}`;
}

export function getProjectRequirementsRoute(projectId: string): string {
    return `/projects/${projectId}/requirements`;
}

export function getProjectCategoriesRoute(projectId: string): string {
    return `/projects/${projectId}/categories`;
}

export function getProjectCategoryDetailsRoute(projectId: string, categoryId: string): string {
    return `/projects/${projectId}/categories/${categoryId}`;
}

export function getProjectCategoryDetailsCloseRoute(route: string): string | undefined {
    const routeMatch = PROJECT_CATEGORY_DETAILS_ROUTE_PATTERN.exec(route);

    if (routeMatch === null) {
        return undefined;
    }

    const projectId = routeMatch[1];

    return getProjectCategoriesRoute(projectId);
}
