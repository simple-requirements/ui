import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";

const { Given, When, Then } = createBdd(test);

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:3000";
const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const HIDDEN_PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const REQUIREMENT_ID = "33333333-3333-4333-8333-333333333333";
const CATEGORY_ID = "44444444-4444-4444-8444-444444444444";
const TICKET_ID = "55555555-5555-4555-8555-555555555555";
const ACCESS_TOKEN = "permission-aware-token";

type TestRole =
  | "Viewer"
  | "Developer"
  | "Requirements Engineer"
  | "Administrator";

type ProjectRole = "viewer" | "developer" | "requirements_engineer";

function projectRoles(role: TestRole): readonly ProjectRole[] {
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

function isAdministrator(role: TestRole): boolean {
  return role === "Administrator";
}

function currentUser(role: TestRole) {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    username: "permission-user",
    email: "permission-user@example.org",
    displayName: role,
    status: "active",
    globalRoles: isAdministrator(role) ? ["administrator"] : [],
    projectMemberships: isAdministrator(role)
      ? []
      : [{ projectId: PROJECT_ID, roles: projectRoles(role) }],
  };
}

const projects = [
  {
    id: PROJECT_ID,
    name: "Assigned Project",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
    ticketUrlTemplate: null,
  },
  {
    id: HIDDEN_PROJECT_ID,
    name: "Unassigned Project",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
    ticketUrlTemplate: null,
  },
] as const;

const requirement = {
  id: REQUIREMENT_ID,
  projectId: PROJECT_ID,
  categoryId: CATEGORY_ID,
  sequenceNumber: 1,
  revisionNumber: 2,
  visibleKey: "FR-AUTH-0001",
  status: "approved",
  description: "Users can sign in.",
  priority: "p1",
  owner: "Alice",
  rationale: null,
  source: null,
  rejectionReason: null,
  reviewer: "Rita Reviewer",
  obsoletedBy: null,
  rejectedAt: null,
  deletedAt: null,
  approvedAt: "2026-09-01T10:00:00.000Z",
  implementedAt: null,
  obsolescenceReason: null,
  obsoleteAt: null,
  implementationTickets: [
    {
      id: TICKET_ID,
      requirementId: REQUIREMENT_ID,
      ticketId: "AUTH-42",
      completedBy: "Dev Example",
      completedAt: "2026-09-02",
      url: null,
      createdAt: "2026-09-02T10:00:00.000Z",
      updatedAt: "2026-09-02T10:00:00.000Z",
    },
  ],
  createdAt: "2026-08-30T10:00:00.000Z",
  updatedAt: "2026-09-02T10:00:00.000Z",
};

async function mockPermissionApi(page: Page, role: TestRole): Promise<void> {
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
        body: JSON.stringify({ accessToken: ACCESS_TOKEN, user: currentUser(role) }),
      });
      return;
    }

    if (pathname === "/auth/me") {
      expect(request.headers().authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentUser(role)),
      });
      return;
    }

    if (pathname === "/projects" && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(projects),
      });
      return;
    }

    if (
      pathname === `/projects/${PROJECT_ID}/requirements` &&
      request.method() === "GET"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([requirement]),
      });
      return;
    }

    if (
      pathname === `/projects/${PROJECT_ID}/requirements/${REQUIREMENT_ID}/review-summary`
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          state: "not_started",
          commentCount: 0,
          openCommentCount: 0,
        }),
      });
      return;
    }

    if (pathname === `/projects/${HIDDEN_PROJECT_ID}/requirements`) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: `Unhandled permission test route: ${pathname}` }),
    });
  });
}

async function signIn(page: Page): Promise<void> {
  await page.getByLabel("Username").fill("permission-user");
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Sign in" }).click();
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

    await mockPermissionApi(page, role);
  },
);

When("I open the permission test requirement details", async ({ page }) => {
  await page.goto(
    `/projects/${PROJECT_ID}/requirements/${REQUIREMENT_ID}`,
  );
  await expect(page).toHaveURL(/\/login$/u);
  await signIn(page);
  await expect(page).toHaveURL(
    new RegExp(`/projects/${PROJECT_ID}/requirements/${REQUIREMENT_ID}$`, "u"),
  );
  await expect(page.getByRole("heading", { name: "FR-AUTH-0001" })).toBeVisible();
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
