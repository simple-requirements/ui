import { useSelector } from '@tanstack/react-store';

import type { AuthenticatedProjectMembership, AuthenticatedUser, ProjectRole } from '@/auth/authTypes';
import { isAdministrator } from '@/auth/globalPermissions';
import { authStore } from '@/stores/authStore';

export type ProjectPermissions = Readonly<{
    known: boolean;
    canReadProject: boolean;
    canManageRequirements: boolean;
    canManageTickets: boolean;
}>;

export const projectPermissionKinds = { read: 'read', manageRequirements: 'manage_requirements' } as const;

export type ProjectPermission = (typeof projectPermissionKinds)[keyof typeof projectPermissionKinds];

/**
 * Finds the authenticated account's membership for one project.
 * @param user Authenticated account, when available.
 * @param projectId Project whose membership should be resolved.
 * @returns Matching membership, or undefined when the account is not a member.
 */
function getProjectMembership(
    user: AuthenticatedUser | undefined,
    projectId: string | undefined,
): AuthenticatedProjectMembership | undefined {
    if (user === undefined || projectId === undefined) return undefined;

    return user.projectMemberships?.find((membership) => membership.projectId === projectId);
}

/**
 * Resolves the single project role for an account in one project.
 * @param user Authenticated account, when available.
 * @param projectId Project whose role should be resolved.
 * @returns The account's fixed project role when it is a member, otherwise undefined.
 */
export function getProjectRole(
    user: AuthenticatedUser | undefined,
    projectId: string | undefined,
): ProjectRole | undefined {
    if (getProjectMembership(user, projectId) === undefined || user === undefined || user.role === 'administrator') {
        return undefined;
    }

    return user.role;
}

/**
 * Checks whether an account has a specific project role in one project.
 * @param user Authenticated account, when available.
 * @param projectId Project whose membership should be checked.
 * @param role Project role to compare with the account's fixed role.
 * @returns True when the account is a member and has the requested role.
 */
export function hasProjectRole(
    user: AuthenticatedUser | undefined,
    projectId: string | undefined,
    role: ProjectRole,
): boolean {
    return getProjectRole(user, projectId) === role;
}

/**
 * Checks whether an account has any requested project role in one project.
 * @param user Authenticated account, when available.
 * @param projectId Project whose membership should be checked.
 * @param roles Project roles accepted by the operation.
 * @returns True when the account is a member and its fixed role is accepted.
 */
export function hasAnyProjectRole(
    user: AuthenticatedUser | undefined,
    projectId: string | undefined,
    roles: readonly ProjectRole[],
): boolean {
    const role = getProjectRole(user, projectId);

    return role !== undefined && roles.includes(role);
}

/**
 * Checks whether the authenticated payload contains project membership information.
 * @param user Authenticated account, when available.
 * @returns True when memberships were supplied by the backend.
 */
export function hasKnownProjectMemberships(user: AuthenticatedUser | undefined): boolean {
    return user?.projectMemberships !== undefined;
}

/**
 * Calculates UI permissions from the account's fixed role and project membership.
 * @param user Authenticated account, when available.
 * @param projectId Project whose permissions should be calculated.
 * @returns Permission flags used by project-scoped UI.
 */
export function getProjectPermissions(
    user: AuthenticatedUser | undefined,
    projectId: string | undefined,
): ProjectPermissions {
    const role = getProjectRole(user, projectId);
    const member = role !== undefined;
    const requirementsEngineer = role === 'requirements_engineer';
    const developer = role === 'developer';

    return {
        known: hasKnownProjectMemberships(user),
        canReadProject: member,
        canManageRequirements: requirementsEngineer,
        canManageTickets: requirementsEngineer || developer,
    };
}

/**
 * Checks one named project permission.
 * @param permissions Calculated project permissions.
 * @param permission Permission required by a route or action.
 * @returns True when the permission is granted.
 */
export function hasProjectPermission(permissions: ProjectPermissions, permission: ProjectPermission): boolean {
    switch (permission) {
        case projectPermissionKinds.read:
            return permissions.canReadProject;
        case projectPermissionKinds.manageRequirements:
            return permissions.canManageRequirements;
    }
}

/**
 * Reads project permissions reactively for the authenticated account.
 * @param projectId Project whose permissions should be calculated.
 * @returns Current project permission flags.
 */
export function useProjectPermissions(projectId: string | undefined): ProjectPermissions {
    const user = useSelector(authStore, (state) => state.user);

    return getProjectPermissions(user, projectId);
}

/**
 * Reads whether the authenticated account is an Administrator.
 * @returns True only for the dedicated Administrator role.
 */
export function useIsAdministrator(): boolean {
    return useSelector(authStore, (state) => isAdministrator(state.user));
}
