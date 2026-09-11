import { expect } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";
import {
  createImplementationTicket,
  createTestCategory,
  createTestProject,
  createTestRequirement,
  E2E_ACCESS_TOKEN,
  E2E_ADMIN_USER_ID,
  E2E_DEVELOPER_ACCESS_TOKEN,
  E2E_DEVELOPER_LOGIN_USERNAME,
  E2E_DEVELOPER_USER_ID,
  E2E_LOGIN_USERNAME,
  E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN,
  E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
  E2E_REQUIREMENTS_ENGINEER_USER_ID,
  E2E_VIEWER_ACCESS_TOKEN,
  E2E_VIEWER_LOGIN_USERNAME,
  E2E_VIEWER_USER_ID,
  removeProjectMembership,
  resetTestBackend,
  setProjectMembership,
  updateRequirementStatus,
  signInToRealBackend,
  type ProjectRole,
  type Requirement,
} from "./authenticated-test-backend";

const { Given, When, Then } = createBdd(test);

type TestRole =
  | "Viewer"
  | "Developer"
  | "Requirements Engineer"
  | "Administrator";

type PermissionContext = Readonly<{
  role: TestRole;
  requirement: Requirement;
  projectId: string;
  hiddenProjectId: string;
}>;

let context: PermissionContext | undefined;

function requireContext(): PermissionContext {
  if (context === undefined) throw new Error("Permission test context was not created.");
  return context;
}

function configuredPrincipal(
  role: TestRole,
): Readonly<{ token: string; userId: string; username: string }> {
  switch (role) {
    case "Administrator":
      return { token: E2E_ACCESS_TOKEN, userId: E2E_ADMIN_USER_ID, username: E2E_LOGIN_USERNAME };
    case "Requirements Engineer":
      return {
        token: E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN,
        userId: E2E_REQUIREMENTS_ENGINEER_USER_ID,
        username: E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
      };
    case "Developer":
      return {
        token: E2E_DEVELOPER_ACCESS_TOKEN,
        userId: E2E_DEVELOPER_USER_ID,
        username: E2E_DEVELOPER_LOGIN_USERNAME,
      };
    case "Viewer":
      return {
        token: E2E_VIEWER_ACCESS_TOKEN,
        userId: E2E_VIEWER_USER_ID,
        username: E2E_VIEWER_LOGIN_USERNAME,
      };
  }
}

function roleMembership(role: TestRole): readonly ProjectRole[] {
  switch (role) {
    case "Viewer":
      return ["viewer"];
    case "Developer":
      return ["developer"];
    case "Requirements Engineer":
      return ["requirements_engineer"];
    case "Administrator":
      return [];
  }
}

Given(
  "the permission-aware frontend signs me in as {string}",
  async ({ page }, roleName: string) => {
    const roles: readonly TestRole[] = [
      "Viewer",
      "Developer",
      "Requirements Engineer",
      "Administrator",
    ];
    const role = roles.find((candidate) => candidate === roleName);
    if (role === undefined) throw new Error(`Unknown permission test role: ${roleName}`);

    const principal = configuredPrincipal(role);
    await resetTestBackend();
    const project = await createTestProject("Assigned Project");
    const hiddenProject = await createTestProject("Unassigned Project");
    const category = await createTestCategory(project.id, {
      key: "AUTH",
      type: "FR",
      name: "Authentication",
    });
    const draft = await createTestRequirement(project.id, {
      categoryId: category.id,
      description: "Users can sign in.",
      priority: "p1",
      owner: "Alice",
      rationale: null,
      source: null,
    });
    const requirement = await updateRequirementStatus(project.id, draft.id, {
      status: "approved",
      reviewer: "E2E Requirements Engineer",
    });
    await createImplementationTicket(project.id, requirement.id, "AUTH-42");

    await removeProjectMembership(project.id, E2E_ADMIN_USER_ID);
    await removeProjectMembership(hiddenProject.id, E2E_ADMIN_USER_ID);

    if (role !== "Administrator") {
      await setProjectMembership(project.id, principal.userId, roleMembership(role));
      await removeProjectMembership(hiddenProject.id, principal.userId);
    }

    context = {
      role,
      requirement,
      projectId: project.id,
      hiddenProjectId: hiddenProject.id,
    };
    await page.goto("/login");
    await signInToRealBackend(page, principal.username);
  },
);

When("I open the permission test requirement details", async ({ page }) => {
  const { projectId, requirement, role } = requireContext();
  await page.goto(`/projects/${projectId}/requirements/${requirement.id}`);
  await signInToRealBackend(page, configuredPrincipal(role).username);
  await expect(page.getByRole("heading", { name: requirement.visibleKey })).toBeVisible();
});

Then("only the assigned permission test project should be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Assigned Project/iu })).toBeVisible();
  await expect(page.getByRole("button", { name: /Unassigned Project/iu })).toHaveCount(0);
});

Then("project creation should not be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: "New project" })).toHaveCount(0);
});

Then("project creation should be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: "New project" })).toBeVisible();
});

Then("requirement mutation actions should not be visible", async ({ page }) => {
  for (const name of ["Create", "Edit", "Obsolete", "Implemented"]) {
    await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
  }
});

Then("requirement mutation actions should be visible", async ({ page }) => {
  for (const name of ["Create", "Edit", "Obsolete", "Implemented"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
});

Then("implementation ticket mutation actions should not be visible", async ({ page }) => {
  const ticketPanel = page.getByRole("region", {
    name: "Implementation tickets",
    exact: true,
  });

  await expect(ticketPanel.getByText(/AUTH-42/u)).toBeVisible();
  await expect(page.getByRole("button", { name: "Add ticket" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Edit ticket" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete ticket" })).toHaveCount(0);
});

Then("implementation ticket mutation actions should be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Add ticket" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit ticket" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete ticket" })).toBeVisible();
});
