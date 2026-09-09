import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";

const { Given, When, Then } = createBdd(test);
const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:3000";
let userStatus: "pending" | "active" = "pending";
let sessionRevokedAt: string | null = null;

function managedUser() {
  return {
    id: "user-2",
    username: "pending-user",
    email: "pending@example.org",
    displayName: "Pending User",
    status: userStatus,
    globalRoles: [],
    emailVerifiedAt: "2026-09-01T10:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  };
}

async function mockAdministrationApi(page: Page): Promise<void> {
  userStatus = "pending";
  sessionRevokedAt = null;
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
    if (pathname === "/admin/users" && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([managedUser()]),
      });
      return;
    }
    if (pathname === "/admin/users/user-2/status") {
      userStatus = "active";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(managedUser()),
      });
      return;
    }
    if (
      pathname === "/admin/users/user-2/sessions" &&
      request.method() === "GET"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "session-1",
            createdAt: "2026-09-01T10:00:00.000Z",
            lastActivityAt: "2026-09-01T11:00:00.000Z",
            revokedAt: sessionRevokedAt,
          },
        ]),
      });
      return;
    }
    if (pathname === "/admin/users/user-2/sessions/session-1/revoke") {
      sessionRevokedAt = "2026-09-01T12:00:00.000Z";
      await route.fulfill({ status: 204, body: "" });
      return;
    }
    if (pathname === "/projects") {
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
      body: JSON.stringify({ message: "Not found" }),
    });
  });
}

Given("the frontend user-administration API is available", async ({ page }) => {
  await mockAdministrationApi(page);
});
When("I sign in as a frontend Administrator", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Sign in" }).click();
});
When("I open frontend user administration", async ({ page }) => {
  await page.getByRole("button", { name: "Administration" }).click();
  await expect(page).toHaveURL(/\/administration\/users$/u);
});
When("I select the pending user", async ({ page }) => {
  await page.getByRole("button", { name: /Pending User/iu }).click();
});
When("I activate the selected user", async ({ page }) => {
  await page.getByRole("button", { name: "Activate account" }).click();
});
Then(
  "the user should be active in frontend administration",
  async ({ page }) => {
    await expect(
      page.getByRole("row", { name: /Pending User/iu }),
    ).toContainText("active");
  },
);
When("I revoke the selected user's active session", async ({ page }) => {
  await page.getByRole("button", { name: "Revoke", exact: true }).click();
});
Then("the session should be shown as revoked", async ({ page }) => {
  await expect(page.getByRole("row", { name: /Revoked/iu })).toBeVisible();
});
