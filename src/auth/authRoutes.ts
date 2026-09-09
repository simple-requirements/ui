export const LOGIN_ROUTE = "/login";
export const USER_ADMINISTRATION_ROUTE = "/administration/users";
export const PROJECT_MEMBERSHIP_ADMINISTRATION_ROUTE =
  "/administration/project-memberships";

export type LoginLocationState = Readonly<{
  returnTo?: string;
  reason?: "session-expired";
}>;

export function getSafeReturnTo(state: unknown): string {
  if (typeof state !== "object" || state === null) {
    return "/";
  }

  const returnTo = (state as LoginLocationState).returnTo;

  if (
    typeof returnTo !== "string" ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo === LOGIN_ROUTE ||
    returnTo.startsWith(`${LOGIN_ROUTE}?`) ||
    returnTo.startsWith(`${LOGIN_ROUTE}#`)
  ) {
    return "/";
  }

  return returnTo;
}

export function getCurrentRelativeUrl(
  location: Readonly<{ pathname: string; search: string; hash: string }>,
): string {
  return `${location.pathname}${location.search}${location.hash}`;
}
