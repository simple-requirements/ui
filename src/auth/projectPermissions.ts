import { useSelector } from "@tanstack/react-store";

import type {
  AuthenticatedUser,
  ProjectRole,
} from "@/auth/authTypes";
import { authStore } from "@/stores/authStore";

export type ProjectPermissions = Readonly<{
  known: boolean;
  canReadProject: boolean;
  canAdministerProject: boolean;
  canManageRequirements: boolean;
  canManageTickets: boolean;
}>;

function hasRole(
  roles: readonly ProjectRole[] | undefined,
  role: ProjectRole,
): boolean {
  return roles?.includes(role) ?? false;
}

export function getProjectRoles(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
): readonly ProjectRole[] | undefined {
  if (user === undefined || projectId === undefined) return undefined;
  if (user.projectMemberships === undefined) return undefined;

  return (
    user.projectMemberships.find(
      (membership) => membership.projectId === projectId,
    )?.roles ?? []
  );
}

export function getProjectPermissions(
  user: AuthenticatedUser | undefined,
  projectId: string | undefined,
): ProjectPermissions {
  const administrator =
    user?.globalRoles.includes("administrator") ?? false;
  const roles = getProjectRoles(user, projectId);
  const known = roles !== undefined;

  // During a rolling frontend/backend deployment an older /auth/me payload may
  // not contain projectMemberships yet. In that compatibility state we keep
  // the legacy UI visible and continue to rely on backend authorization.
  const legacyFallback = !known;
  const requirementsEngineer = hasRole(roles, "requirements_engineer");
  const developer = hasRole(roles, "developer");

  return {
    known,
    canReadProject:
      administrator || legacyFallback || (roles?.length ?? 0) > 0,
    canAdministerProject: administrator,
    canManageRequirements: legacyFallback || requirementsEngineer,
    canManageTickets:
      legacyFallback || requirementsEngineer || developer,
  };
}

export function useProjectPermissions(
  projectId: string | undefined,
): ProjectPermissions {
  const user = useSelector(authStore, (state) => state.user);

  return getProjectPermissions(user, projectId);
}

export function useIsAdministrator(): boolean {
  return useSelector(
    authStore,
    (state) => state.user?.globalRoles.includes("administrator") ?? false,
  );
}
