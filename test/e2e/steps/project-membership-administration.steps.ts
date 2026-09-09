import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";

const { Given, When, Then } = createBdd(test);
const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:3000";
const PROJECT_ID = "11111111-1111-4111-8111-111111111111";

type ProjectRole = "requirements_engineer" | "developer" | "viewer";
type Membership = Readonly<{
  userId: string;
  username: string;
  displayName: string;
  roles: readonly ProjectRole[];
}>;

const users = [
  {
    id: "user-1",
    username: "alice",
    email: "alice@example.org",
    displayName: "Alice Member",
    status: "active",
    globalRoles: [],
    emailVerifiedAt: "2026-09-01T10:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "user-2",
    username: "bob",
    email: "bob@example.org",
    displayName: "Bob Builder",
    status: "active",
    globalRoles: [],
    emailVerifiedAt: "2026-09-01T10:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
] as const;

let memberships: Membership[] = [];

function roleValue(label: string): ProjectRole {
  switch (label.trim()) {
    case "Requirements Engineer":
      return "requirements_engineer";
    case "Developer":
      return "developer";
    case "Viewer":
      return "viewer";
    default:
      throw new Error(`Unknown project role: ${label}`);
  }
}

function roleLabels(value: string): string[] {
  return value.split(",").map((label) => label.trim());
}

function userByDisplayName(displayName: string) {
  const user = users.find((candidate) => candidate.displayName === displayName);
  if (user === undefined) {
    throw new Error(`Unknown user: ${displayName}`);
  }
  return user;
}

async function mockProjectMembershipAdministrationApi(page: Page): Promise<void> {
  memberships = [
    {
      userId: "user-1",
      username: "alice",
      displayName: "Alice Member",
      roles: ["viewer"],
    },
  ];

  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());

    if (pathname === "/auth/bootstrap/status") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ registrationAvailable: false }),
      });
      return;
    }
    if (pathname === "/auth/login") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "admin-token",
          user: {
            id: "admin-1",
            username: "admin",
            email: "admin@example.org",
            displayName: "Administrator",
            status: "active",
            globalRoles: ["administrator"],
          },
        }),
      });
      return;
    }
    if (pathname === "/auth/me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "admin-1",
          username: "admin",
          email: "admin@example.org",
          displayName: "Administrator",
          status: "active",
          globalRoles: ["administrator"],
          projectMemberships: [],
        }),
      });
      return;
    }
    if (pathname === "/projects" && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: PROJECT_ID,
            name: "Project Alpha",
            createdAt: "2026-09-01T09:00:00.000Z",
            updatedAt: "2026-09-01T09:00:00.000Z",
            ticketUrlTemplate: null,
          },
        ]),
      });
      return;
    }
    if (pathname === "/admin/users" && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(users),
      });
      return;
    }
    if (
      pathname === `/admin/projects/${PROJECT_ID}/memberships` &&
      request.method() === "GET"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(memberships),
      });
      return;
    }

    const membershipMatch = pathname.match(
      new RegExp(`^/admin/projects/${PROJECT_ID}/memberships/([^/]+)$`, "u"),
    );
    if (membershipMatch !== null && request.method() === "PUT") {
      const userId = decodeURIComponent(membershipMatch[1] ?? "");
      const user = users.find((candidate) => candidate.id === userId);
      if (user === undefined) {
        await route.fulfill({ status: 404, body: "" });
        return;
      }
      const payload = request.postDataJSON() as { roles: ProjectRole[] };
      const membership: Membership = {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        roles: payload.roles,
      };
      memberships = [
        ...memberships.filter((candidate) => candidate.userId !== user.id),
        membership,
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(membership),
      });
      return;
    }
    if (membershipMatch !== null && request.method() === "DELETE") {
      const userId = decodeURIComponent(membershipMatch[1] ?? "");
      memberships = memberships.filter(
        (candidate) => candidate.userId !== userId,
      );
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: "Not found" }),
    });
  });
}

Given(
  "the frontend project-membership administration API is available",
  async ({ page }) => {
    await mockProjectMembershipAdministrationApi(page);
  },
);

When("I open frontend project membership administration", async ({ page }) => {
  await page.getByRole("button", { name: "Administration" }).click();
  await page.getByRole("link", { name: "Project memberships" }).click();
  await expect(page).toHaveURL(/\/administration\/project-memberships$/u);
});

When(
  "I select the administration project {string}",
  async ({ page }, projectName: string) => {
    await page
      .getByRole("combobox", { name: "Project", exact: true })
      .selectOption({ label: projectName });
  },
);

Then(
  "{string} should have the project role {string}",
  async ({ page }, displayName: string, role: string) => {
    const row = page.getByRole("row", { name: new RegExp(displayName, "u") });
    await expect(row.getByRole("cell").first()).toHaveText(role);
  },
);

Then(
  "{string} should have the project roles {string}",
  async ({ page }, displayName: string, roles: string) => {
    const row = page.getByRole("row", { name: new RegExp(displayName, "u") });
    const currentRoles = row.getByRole("cell").first();
    for (const role of roleLabels(roles)) {
      await expect(currentRoles).toContainText(role);
    }
  },
);

When(
  "I assign {string} the project roles {string}",
  async ({ page }, displayName: string, roles: string) => {
    const user = userByDisplayName(displayName);
    const form = page.getByRole("form", { name: "Assign project membership" });
    await form.getByLabel("User").selectOption(user.id);
    const roleGroup = form.getByRole("group", {
      name: "Roles for new membership",
    });
    for (const role of roleLabels(roles)) {
      await roleGroup.getByLabel(role).check();
    }
    await form.getByRole("button", { name: "Add membership" }).click();
  },
);

When(
  "I change {string} to the project role {string}",
  async ({ page }, displayName: string, role: string) => {
    const row = page.getByRole("row", { name: new RegExp(displayName, "u") });
    const roleGroup = row.getByRole("group", {
      name: `Roles for ${displayName}`,
    });
    const selectedRole = roleValue(role);

    for (const label of ["Requirements Engineer", "Developer", "Viewer"]) {
      const checkbox = roleGroup.getByLabel(label);
      if (roleValue(label) === selectedRole) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }
    await row.getByRole("button", { name: "Save roles" }).click();
  },
);

When(
  "I remove {string} from the project",
  async ({ page }, displayName: string) => {
    const row = page.getByRole("row", { name: new RegExp(displayName, "u") });
    await row.getByRole("button", { name: "Remove membership" }).click();
  },
);

Then(
  "{string} should no longer have a project membership",
  async ({ page }, displayName: string) => {
    await expect(
      page.getByRole("row", { name: new RegExp(displayName, "u") }),
    ).toHaveCount(0);
  },
);
