import { useSelector } from "@tanstack/react-store";

import type {
  AuthenticatedProjectMembership,
  AuthenticatedUser,
  ProjectRole,
} from "@/auth/authTypes";
import { isAdministrator } from "@/auth/globalPermissions";
import { authStore } from "@/stores/authStore";

export type ProjectPermissions = Readonly<{
  known: boolean;
  canReadProject: boolean;
  canAdministerProject: boolean;
  canManageRequirements: boolean;
  canManageTickets: boolean;
}>;

export const projectPermissionKinds = {
  read: "read",
  manageRequirements: "manage_requirements",
} as const;

export type ProjectPermission =
  (typeof projectPermissionKinds)[keyof typeof projectPermissionKinds];

function includesProjectRole(
  roles: readonly ProjectRole[] | undefined,
  role: ProjectRole,
): boolean {
  return roles?.includes(role) ?? false;
}

function getProjectMembership(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
): AuthenticatedProjectMembership | undefined {
  if (user === undefined || projectId === undefined) return undefined;
  if (user.projectMemberships === undefined) return undefined;

  return user.projectMemberships.find(
    (membership) => membership.projectId === projectId,
  );
}

export function getProjectRoles(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
): readonly ProjectRole[] | undefined {
  return getProjectMembership(user, projectId)?.roles ??
    (user?.projectMemberships === undefined ? undefined : []);
}

export function hasProjectRole(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
  role: ProjectRole,
): boolean {
  return includesProjectRole(getProjectRoles(user, projectId), role);
}

export function hasAnyProjectRole(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
  roles: readonly ProjectRole[],
): boolean {
  const userRoles = getProjectRoles(user, projectId);

  return roles.some((role) => includesProjectRole(userRoles, role));
}

export function hasKnownProjectMemberships(
  user: AuthenticatedUser | undefined,
): boolean {
  return user?.projectMemberships !== undefined;
}

function usesLegacyProjectMembershipFallback(
  user: AuthenticatedUser | undefined,
): boolean {
  // During a rolling frontend/backend deployment an older /auth/me payload may
  // not contain projectMemberships yet. In that compatibility state we keep
  // the legacy UI visible and continue to rely on backend authorization.
  return !hasKnownProjectMemberships(user);
}

export function getProjectPermissions(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
): ProjectPermissions {
  const administrator = isAdministrator(user);
  const roles = getProjectRoles(user, projectId);
  const known = roles !== undefined;
  const legacyFallback = usesLegacyProjectMembershipFallback(user);
  const requirementsEngineer = includesProjectRole(
    roles,
    "requirements_engineer",
  );
  const developer = includesProjectRole(roles, "developer");

  return {
    known,
    canReadProject: administrator || legacyFallback || (roles?.length ?? 0) > 0,
    canAdministerProject: administrator,
    canManageRequirements: legacyFallback || requirementsEngineer,
    canManageTickets: legacyFallback || requirementsEngineer || developer,
  };
}

export function hasProjectPermission(
  permissions: ProjectPermissions,
  permission: ProjectPermission,
): boolean {
  switch (permission) {
    case projectPermissionKinds.read:
      return permissions.canReadProject;
    case projectPermissionKinds.manageRequirements:
      return permissions.canManageRequirements;
  }
}

export function useProjectPermissions(
  projectId: string | undefined,
): ProjectPermissions {
  const user = useSelector(authStore, (state) => state.user);

  return getProjectPermissions(user, projectId);
}

export function useIsAdministrator(): boolean {
  return useSelector(authStore, (state) => isAdministrator(state.user));
}
