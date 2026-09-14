import type { AccountRole } from "@/auth/authTypes";

export const ADMINISTRATOR_ROLE: AccountRole = "administrator";

/**
 * Checks whether the authenticated account has the requested account role.
 * @param user Authenticated account, when available.
 * @param role Account role to compare with the user's single role.
 * @returns True when the authenticated account has the requested role.
 */
export function hasAccountRole(
  user: Readonly<{ role: AccountRole | null }> | undefined,
  role: AccountRole,
): boolean {
  return user?.role === role;
}

/**
 * Checks whether the authenticated account is an Administrator.
 * @param user Authenticated account, when available.
 * @returns True only for the dedicated Administrator account role.
 */
export function isAdministrator(
  user: Readonly<{ role: AccountRole | null }> | undefined,
): boolean {
  return hasAccountRole(user, ADMINISTRATOR_ROLE);
}
