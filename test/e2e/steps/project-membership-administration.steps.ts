import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";
import {
  createTestProject,
  E2E_DEVELOPER_USER_ID,
  E2E_VIEWER_USER_ID,
  getUserById,
  listProjectMemberships,
  openAuthenticatedRoute,
  resetTestBackend,
  setProjectMembership,
  type Project,
  type ProjectRole,
  type UserAdministration,
} from "./authenticated-test-backend";

const { Given, When, Then } = createBdd(test);

interface MembershipContext {
  project: Project;
  usersByDisplayName: Map<string, UserAdministration>;
}

let context: MembershipContext | undefined;

function requireContext(): MembershipContext {
  if (context === undefined) {
    throw new Error("Project membership test context was not created.");
  }
  return context;
}

function userByDisplayName(displayName: string): UserAdministration {
  const user = requireContext().usersByDisplayName.get(displayName);
  if (user === undefined) throw new Error(`Unknown user: ${displayName}`);
  return user;
}

function expectedProjectRole(user: UserAdministration): ProjectRole {
  if (user.role === null || user.role === "administrator") {
    throw new Error(`${user.displayName} does not have a project-scoped role.`);
  }
  return user.role;
}

function membershipRow(page: Page, displayName: string) {
  return page.getByRole("row").filter({ hasText: displayName });
}

async function expectBackendMembershipRole(
  displayName: string,
  role: ProjectRole,
): Promise<void> {
  const user = userByDisplayName(displayName);
  expect(expectedProjectRole(user)).toBe(role);
  await expect
    .poll(async () => {
      const memberships = await listProjectMemberships(
        requireContext().project.id,
      );
      return memberships.some((membership) => membership.userId === user.id);
    })
    .toBe(true);
}

async function openAdministrationProject(page: Page): Promise<void> {
  await openAuthenticatedRoute(page, "/admin/projects");
  await page
    .getByRole("link", { name: new RegExp(requireContext().project.name, "u") })
    .click();
  await expect(
    page.getByRole("heading", { name: requireContext().project.name }),
  ).toBeVisible();
}

Given(
  "the frontend project-membership administration API is available",
  async () => {
    await resetTestBackend();
    const project = await createTestProject("Project Alpha");
    const viewer = await getUserById(E2E_VIEWER_USER_ID);
    const developer = await getUserById(E2E_DEVELOPER_USER_ID);
    await setProjectMembership(project.id, viewer.id);

    context = {
      project,
      usersByDisplayName: new Map([
        [viewer.displayName, viewer],
        [developer.displayName, developer],
      ]),
    };
  },
);

When("I sign in as a frontend Administrator", async ({ page }) => {
  await openAuthenticatedRoute(page, "/");
});

When("I open frontend project membership administration", async ({ page }) => {
  await openAdministrationProject(page);
});

When(
  "I select the administration project {string}",
  async ({ page }, projectName: string) => {
    if (projectName !== requireContext().project.name) {
      throw new Error(
        `Expected project "${requireContext().project.name}" but got "${projectName}".`,
      );
    }
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
  },
);

Then(
  "{string} should have the project role {string}",
  async ({ page }, displayName: string, roleLabel: string) => {
    const role = expectedProjectRole(userByDisplayName(displayName));
    await expectBackendMembershipRole(displayName, role);
    const row = membershipRow(page, displayName);
    await expect(row).toBeVisible();
    await expect(row).toContainText(roleLabel);
  },
);

When(
  "I assign {string} to the project",
  async ({ page }, displayName: string) => {
    const user = userByDisplayName(displayName);
    await page
      .getByRole("region", { name: "Project memberships" })
      .getByLabel("User", { exact: true })
      .selectOption(user.id);
    await page.getByRole("button", { name: "Add membership" }).click();
    await expectBackendMembershipRole(displayName, expectedProjectRole(user));
    await expect(membershipRow(page, displayName)).toBeVisible();
  },
);

When(
  "I remove {string} from the project",
  async ({ page }, displayName: string) => {
    await membershipRow(page, displayName)
      .getByRole("button", { name: "Remove membership" })
      .click();
  },
);

Then(
  "{string} should no longer have a project membership",
  async ({ page }, displayName: string) => {
    const user = userByDisplayName(displayName);
    await expect
      .poll(async () => {
        const memberships = await listProjectMemberships(
          requireContext().project.id,
        );
        return memberships.some((membership) => membership.userId === user.id);
      })
      .toBe(false);
    await expect(membershipRow(page, displayName)).toHaveCount(0);
  },
);
