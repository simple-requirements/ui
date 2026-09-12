import { apiFetch } from '@/api/fetch';
import type { AuthenticatedUser, ProjectRole, UserStatus } from '@/auth/authTypes';

type ApiResponse<TData, TStatus extends number = number> = Readonly<{ data: TData; status: TStatus; headers: Headers }>;

export type LoginRequest = Readonly<{ username: string; password: string }>;
export type LoginResponse = Readonly<{ accessToken: string; user: AuthenticatedUser }>;
export type RegisterUserRequest = Readonly<{ username: string; email: string; displayName: string; password: string }>;
export type BootstrapAdministratorRequest = RegisterUserRequest & Readonly<{ bootstrapSecret?: string }>;
export type MessageResponse = Readonly<{ message: string }>;
export type BootstrapStatusResponse = Readonly<{ registrationAvailable: boolean }>;
export type UserAdministrationResponse = AuthenticatedUser
    & Readonly<{ emailVerifiedAt: string | null; createdAt: string; updatedAt: string }>;
export type SessionResponse = Readonly<{
    id: string;
    createdAt: string;
    lastActivityAt: string;
    revokedAt: string | null;
}>;
export type ProjectMembershipResponse = Readonly<{
    userId: string;
    username: string;
    displayName: string;
    roles: readonly ProjectRole[];
}>;

function jsonRequest(method: 'POST' | 'PATCH' | 'PUT', data: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse, 200>> {
    return apiFetch('/auth/login', jsonRequest('POST', data));
}

export function logout(): Promise<ApiResponse<undefined, 204>> {
    return apiFetch('/auth/logout', { method: 'POST' });
}

export function getAuthenticatedUser(accessToken?: string): Promise<ApiResponse<AuthenticatedUser, 200>> {
    return apiFetch('/auth/me', {
        method: 'GET',
        headers: accessToken === undefined ? undefined : { Authorization: `Bearer ${accessToken}` },
    });
}

export function getAuthenticationBootstrapStatus(): Promise<ApiResponse<BootstrapStatusResponse, 200>> {
    return apiFetch('/auth/bootstrap/status', { method: 'GET' });
}

export function bootstrapAdministrator(
    data: BootstrapAdministratorRequest,
): Promise<ApiResponse<MessageResponse, 202>> {
    return apiFetch('/auth/bootstrap/administrator', jsonRequest('POST', data));
}

export function registerUser(data: RegisterUserRequest): Promise<ApiResponse<MessageResponse, 202>> {
    return apiFetch('/auth/register', jsonRequest('POST', data));
}

export function confirmEmailVerification(token: string): Promise<ApiResponse<undefined, 204>> {
    return apiFetch('/auth/email-verification/confirm', jsonRequest('POST', { token }));
}

export function resendEmailVerification(username: string): Promise<ApiResponse<MessageResponse, 202>> {
    return apiFetch('/auth/email-verification/resend', jsonRequest('POST', { username }));
}

export function requestPasswordReset(email: string): Promise<ApiResponse<MessageResponse, 202>> {
    return apiFetch('/auth/password-reset/request', jsonRequest('POST', { email }));
}

export function confirmPasswordReset(token: string, password: string): Promise<ApiResponse<undefined, 204>> {
    return apiFetch('/auth/password-reset/confirm', jsonRequest('POST', { token, password }));
}

export function listUsers(): Promise<ApiResponse<UserAdministrationResponse[], 200>> {
    return apiFetch('/admin/users', { method: 'GET' });
}

export function getUser(userId: string): Promise<ApiResponse<UserAdministrationResponse, 200>> {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}`, { method: 'GET' });
}

export function updateUserStatus(
    userId: string,
    status: Exclude<UserStatus, 'pending'>,
): Promise<ApiResponse<UserAdministrationResponse, 200>> {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}/status`, jsonRequest('PATCH', { status }));
}

export function listUserSessions(userId: string): Promise<ApiResponse<SessionResponse[], 200>> {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}/sessions`, { method: 'GET' });
}

export function revokeAllUserSessions(userId: string): Promise<ApiResponse<undefined, 204>> {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}/sessions/revoke`, { method: 'POST' });
}

export function revokeUserSession(userId: string, sessionId: string): Promise<ApiResponse<undefined, 204>> {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/revoke`, {
        method: 'POST',
    });
}

export function listProjectMemberships(projectId: string): Promise<ApiResponse<ProjectMembershipResponse[], 200>> {
    return apiFetch(`/admin/projects/${encodeURIComponent(projectId)}/memberships`, { method: 'GET' });
}

export function setProjectMembership(
    projectId: string,
    userId: string,
    roles: readonly ProjectRole[],
): Promise<ApiResponse<ProjectMembershipResponse, 200>> {
    return apiFetch(
        `/admin/projects/${encodeURIComponent(projectId)}/memberships/${encodeURIComponent(userId)}`,
        jsonRequest('PUT', { roles }),
    );
}

export function removeProjectMembership(projectId: string, userId: string): Promise<ApiResponse<undefined, 204>> {
    return apiFetch(`/admin/projects/${encodeURIComponent(projectId)}/memberships/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
    });
}
