export const ADMINISTRATOR_USERS_ROUTE = '/admin/users';
export const ADMINISTRATOR_PROJECTS_ROUTE = '/admin/projects';

export type AdministratorSection = 'users' | 'projects';

export function getAdministratorUserRoute(userId: string): string {
    return `${ADMINISTRATOR_USERS_ROUTE}/${encodeURIComponent(userId)}`;
}

export function getAdministratorProjectRoute(projectId: string): string {
    return `${ADMINISTRATOR_PROJECTS_ROUTE}/${encodeURIComponent(projectId)}`;
}

export function getActiveAdministratorSection(pathname: string): AdministratorSection | undefined {
    if (pathname.startsWith(ADMINISTRATOR_USERS_ROUTE)) return 'users';
    if (pathname.startsWith(ADMINISTRATOR_PROJECTS_ROUTE)) return 'projects';
    return undefined;
}
