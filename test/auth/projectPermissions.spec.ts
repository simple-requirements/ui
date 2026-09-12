import { describe, expect, it } from "vitest";

import type { AuthenticatedUser, ProjectRole } from "@/auth/authTypes";
import { isAdministrator } from "@/auth/globalPermissions";
import {
  getProjectPermissions,
  getProjectRoles,
  hasAnyProjectRole,
  hasProjectPermission,
  hasProjectRole,
  projectPermissionKinds,
} from "@/auth/projectPermissions";

function user(
  roles: readonly ProjectRole[] | undefined,
  globalRoles: AuthenticatedUser["globalRoles"] = [],
): AuthenticatedUser {
  return {
    id: "user-1",
    username: "alice",
    email: "alice@example.org",
    displayName: "Alice",
    status: "active",
    globalRoles,
    ...(roles === undefined
      ? {}
      : { projectMemberships: [{ projectId: "project-alpha", roles }] }),
  };
}

describe("global permissions", () => {
  it("identifies administrators from global roles", () => {
    expect(isAdministrator(user([], ["administrator"]))).toBe(true);
    expect(isAdministrator(user([]))).toBe(false);
    expect(isAdministrator(undefined)).toBe(false);
  });
});

describe("project permissions", () => {
  it("keeps legacy access open when project memberships are absent", () => {
    const permissions = getProjectPermissions(user(undefined), "project-alpha");

    expect(permissions.known).toBe(false);
    expect(permissions.canReadProject).toBe(true);
    expect(permissions.canManageRequirements).toBe(true);
    expect(permissions.canManageTickets).toBe(true);
  });

  it("grants read-only access to viewers", () => {
    const permissions = getProjectPermissions(user(["viewer"]), "project-alpha");

    expect(getProjectRoles(user(["viewer"]), "project-alpha")).toEqual(["viewer"]);
    expect(permissions.known).toBe(true);
    expect(permissions.canReadProject).toBe(true);
    expect(permissions.canManageRequirements).toBe(false);
    expect(permissions.canManageTickets).toBe(false);
  });

  it("grants ticket management to developers without requirement management", () => {
    const permissions = getProjectPermissions(user(["developer"]), "project-alpha");

    expect(hasProjectRole(user(["developer"]), "project-alpha", "developer")).toBe(
      true,
    );
    expect(permissions.canReadProject).toBe(true);
    expect(permissions.canManageRequirements).toBe(false);
    expect(permissions.canManageTickets).toBe(true);
  });

  it("grants requirement and ticket management to requirements engineers", () => {
    const permissions = getProjectPermissions(
      user(["requirements_engineer"]),
      "project-alpha",
    );

    expect(
      hasAnyProjectRole(user(["requirements_engineer"]), "project-alpha", [
        "requirements_engineer",
        "developer",
      ]),
    ).toBe(true);
    expect(
      hasProjectPermission(permissions, projectPermissionKinds.manageRequirements),
    ).toBe(true);
    expect(permissions.canManageTickets).toBe(true);
  });

  it("grants administrators project administration and read access", () => {
    const permissions = getProjectPermissions(
      user([], ["administrator"]),
      "project-alpha",
    );

    expect(hasProjectPermission(permissions, projectPermissionKinds.read)).toBe(
      true,
    );
    expect(permissions.canAdministerProject).toBe(true);
  });
});
