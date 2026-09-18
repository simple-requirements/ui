export const LOGIN_ROUTE = '/login';
export const ADMINISTRATOR_USERS_ROUTE = '/admin/users';
export const ADMINISTRATOR_PROJECTS_ROUTE = '/admin/projects';

export function getAdministratorUserRoute(userId: string): string {
    return `${ADMINISTRATOR_USERS_ROUTE}/${encodeURIComponent(userId)}`;
}

export function getAdministratorProjectRoute(projectId: string): string {
    return `${ADMINISTRATOR_PROJECTS_ROUTE}/${encodeURIComponent(projectId)}`;
}

export type LoginLocationState = Readonly<{ returnTo?: string; reason?: 'session-expired' }>;

/**
 * Resolves a safe internal destination after authentication.
 * @param state Router state supplied by the login redirect.
 * @returns Internal return path, or the workspace root when unsafe or absent.
 */
export function getSafeReturnTo(state: unknown): string {
    if (typeof state !== 'object' || state === null) {
        return '/';
    }

    const returnTo = (state as LoginLocationState).returnTo;

    if (
        typeof returnTo !== 'string'
        || !returnTo.startsWith('/')
        || returnTo.startsWith('//')
        || returnTo === LOGIN_ROUTE
        || returnTo.startsWith(`${LOGIN_ROUTE}?`)
        || returnTo.startsWith(`${LOGIN_ROUTE}#`)
    ) {
        return '/';
    }

    return returnTo;
}

/**
 * Serializes the current router location into an application-relative URL.
 * @param location Current pathname, query string, and hash.
 * @returns Relative URL suitable for login return state.
 */
export function getCurrentRelativeUrl(location: Readonly<{ pathname: string; search: string; hash: string }>): string {
    return `${location.pathname}${location.search}${location.hash}`;
}
