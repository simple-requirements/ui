import { describe, expect, it } from "vitest";

import type {
  AccountRole,
  AuthenticatedUser,
  ProjectRole,
} from "@/auth/authTypes";
import { isAdministrator } from "@/auth/globalPermissions";
import {
  getProjectPermissions,
  getProjectRole,
  hasAnyProjectRole,
  hasProjectPermission,
  hasProjectRole,
  projectPermissionKinds,
} from "@/auth/projectPermissions";

/**
 * Builds an authenticated account with optional project membership.
 * @param role Account's single role.
 * @param member Whether the account belongs to the project fixture.
 * @returns Authenticated user fixture.
 */
function user(role: AccountRole, member = true): AuthenticatedUser {
  return {
    id: "user-1",
    username: "alice",
    email: "alice@example.org",
    displayName: "Alice",
    status: "active",
    role,
    projectMemberships: member ? [{ projectId: "project-alpha" }] : [],
  };
}

describe("global permissions", () => {
  it("identifies administrators from the single account role", () => {
    expect(isAdministrator(user("administrator", false))).toBe(true);
    expect(isAdministrator(user("viewer"))).toBe(false);
    expect(isAdministrator(undefined)).toBe(false);
  });
});

describe("project permissions", () => {
  it("denies project access without membership", () => {
    const permissions = getProjectPermissions(
      user("requirements_engineer", false),
      "project-alpha",
    );

    expect(permissions.known).toBe(true);
    expect(permissions.canReadProject).toBe(false);
    expect(permissions.canManageRequirements).toBe(false);
    expect(permissions.canManageTickets).toBe(false);
  });

  it("grants read-only access to viewers", () => {
    const viewer = user("viewer");
    const permissions = getProjectPermissions(viewer, "project-alpha");

    expect(getProjectRole(viewer, "project-alpha")).toBe("viewer");
    expect(permissions.canReadProject).toBe(true);
    expect(permissions.canManageRequirements).toBe(false);
    expect(permissions.canManageTickets).toBe(false);
  });

  it("grants ticket management to developers without requirement management", () => {
    const developer = user("developer");
    const permissions = getProjectPermissions(developer, "project-alpha");

    expect(hasProjectRole(developer, "project-alpha", "developer")).toBe(true);
    expect(permissions.canReadProject).toBe(true);
    expect(permissions.canManageRequirements).toBe(false);
    expect(permissions.canManageTickets).toBe(true);
  });

  it("grants requirement and ticket management to requirements engineers", () => {
    const requirementsEngineer = user("requirements_engineer");
    const acceptedRoles: readonly ProjectRole[] = [
      "requirements_engineer",
      "developer",
    ];
    const permissions = getProjectPermissions(
      requirementsEngineer,
      "project-alpha",
    );

    expect(
      hasAnyProjectRole(requirementsEngineer, "project-alpha", acceptedRoles),
    ).toBe(true);
    expect(
      hasProjectPermission(
        permissions,
        projectPermissionKinds.manageRequirements,
      ),
    ).toBe(true);
    expect(permissions.canManageTickets).toBe(true);
  });

  it("denies Administrators all project-content permissions", () => {
    const permissions = getProjectPermissions(
      user("administrator", false),
      "project-alpha",
    );

    expect(hasProjectPermission(permissions, projectPermissionKinds.read)).toBe(
      false,
    );
    expect(permissions.canManageRequirements).toBe(false);
    expect(permissions.canManageTickets).toBe(false);
  });
});
