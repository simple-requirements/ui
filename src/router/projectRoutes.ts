export type ProjectSubRoute = 'requirements' | 'categories';

export function getProjectRoute(projectId: string): string {
    return `/projects/${projectId}`;
}

export function getProjectRequirementsRoute(projectId: string): string {
    return `/projects/${projectId}/requirements`;
}

export function getProjectCategoriesRoute(projectId: string): string {
    return `/projects/${projectId}/categories`;
}
