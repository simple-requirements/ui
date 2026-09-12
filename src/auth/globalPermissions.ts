import type { AuthenticatedUser, GlobalRole } from "@/auth/authTypes";

export const ADMINISTRATOR_ROLE: GlobalRole = "administrator";

export function hasGlobalRole(
  user: AuthenticatedUser | undefined,
  role: GlobalRole,
): boolean {
  return user?.globalRoles.includes(role) ?? false;
}

export function isAdministrator(user: AuthenticatedUser | undefined): boolean {
  return hasGlobalRole(user, ADMINISTRATOR_ROLE);
}
