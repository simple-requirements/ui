import type { ProjectMembership, ProjectRole, Session, UserAdministration } from './e2eTypes';
import {
    authenticatedHeaders,
    jsonRequest,
    publicJsonRequest,
    publicRequestJson,
    requestEmpty,
    requestJson,
} from './realBackendClient';

export async function listUsers(): Promise<UserAdministration[]> {
    return requestJson<UserAdministration[]>('/admin/users', {}, 200);
}

export async function getUserByDisplayName(displayName: string): Promise<UserAdministration> {
    const users = await listUsers();
    const user = users.find((candidate) => candidate.displayName === displayName);
    if (user === undefined) throw new Error(`User "${displayName}" was not found.`);
    return user;
}

export async function getUserById(userId: string): Promise<UserAdministration> {
    const users = await listUsers();
    const user = users.find((candidate) => candidate.id === userId);
    if (user === undefined) throw new Error(`User with id "${userId}" was not found.`);
    return user;
}

export async function setUserStatus(userId: string, status: 'active' | 'deactivated'): Promise<UserAdministration> {
    return requestJson<UserAdministration>(
        `/admin/users/${encodeURIComponent(userId)}/status`,
        jsonRequest('PATCH', { status }),
        200,
    );
}

export async function listUserSessions(userId: string): Promise<Session[]> {
    return requestJson<Session[]>(`/admin/users/${encodeURIComponent(userId)}/sessions`, {}, 200);
}

export async function revokeUserSession(userId: string, sessionId: string): Promise<void> {
    await requestEmpty(
        `/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/revoke`,
        { method: 'POST', headers: authenticatedHeaders() },
        204,
    );
}

export async function registerUniqueUser(prefix: string, displayName: string): Promise<UserAdministration> {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const username = `${prefix}-${suffix}`.replace(/[^A-Za-z0-9._-]/gu, '-').slice(0, 64);
    const email = `${username}@example.invalid`;

    await publicRequestJson<unknown>(
        '/auth/register',
        publicJsonRequest('POST', { username, email, displayName, password: 'correct horse battery staple' }),
        202,
    );

    const users = await listUsers();
    const user = users.find((candidate) => candidate.username === username);
    if (user === undefined) {
        throw new Error(`Registered user "${username}" was not visible to administration.`);
    }
    return user;
}

export async function listProjectMemberships(projectId: string): Promise<ProjectMembership[]> {
    return requestJson<ProjectMembership[]>(`/admin/projects/${encodeURIComponent(projectId)}/memberships`, {}, 200);
}

export async function setProjectMembership(
    projectId: string,
    userId: string,
    roles: readonly ProjectRole[],
): Promise<ProjectMembership> {
    return requestJson<ProjectMembership>(
        `/admin/projects/${encodeURIComponent(projectId)}/memberships/${encodeURIComponent(userId)}`,
        jsonRequest('PUT', { roles }),
        200,
    );
}

export async function removeProjectMembership(projectId: string, userId: string): Promise<void> {
    await requestEmpty(
        `/admin/projects/${encodeURIComponent(projectId)}/memberships/${encodeURIComponent(userId)}`,
        { method: 'DELETE', headers: authenticatedHeaders() },
        [204, 404],
    );
}
