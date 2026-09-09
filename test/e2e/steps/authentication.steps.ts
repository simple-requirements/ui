import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";

const { Given, When, Then } = createBdd(test);

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:3000";
const PROTECTED_ROUTE = "/projects/11111111-1111-4111-8111-111111111111";
const ACCESS_TOKEN = "frontend-e2e-token";

let authenticatedRequestObserved = false;
let logoutRequestObserved = false;

async function mockAuthenticationApi(page: Page): Promise<void> {
  authenticatedRequestObserved = false;
  logoutRequestObserved = false;

  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

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
          accessToken: ACCESS_TOKEN,
          user: {
            id: "22222222-2222-4222-8222-222222222222",
            username: "alice",
            email: "alice@example.org",
            displayName: "Alice Example",
            status: "active",
            globalRoles: [],
          },
        }),
      });
      return;
    }

    if (pathname === "/auth/me") {
      authenticatedRequestObserved ||= request.headers().authorization === `Bearer ${ACCESS_TOKEN}`;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "22222222-2222-4222-8222-222222222222",
          username: "alice",
          email: "alice@example.org",
          displayName: "Alice Example",
          status: "active",
          globalRoles: [],
          projectMemberships: [
            {
              projectId: "11111111-1111-4111-8111-111111111111",
              roles: ["viewer"],
            },
          ],
        }),
      });
      return;
    }

    if (pathname === "/auth/logout") {
      logoutRequestObserved = true;
      authenticatedRequestObserved ||=
        request.headers().authorization === `Bearer ${ACCESS_TOKEN}`;
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    authenticatedRequestObserved ||=
      request.headers().authorization === `Bearer ${ACCESS_TOKEN}`;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });
}

async function signIn(page: Page): Promise<void> {
  await page.getByLabel("Username").fill("alice");
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(
    new RegExp(`${PROTECTED_ROUTE.replaceAll("/", "\\/")}$`, "u"),
  );
}

Given(
  "the frontend authentication API accepts valid credentials",
  async ({ page }) => {
    await mockAuthenticationApi(page);
  },
);

Given(
  "initial Administrator bootstrap is complete for frontend authentication",
  async ({ page }) => {
    await mockAuthenticationApi(page);
  },
);

Given("I am signed in through the frontend", async ({ page }) => {
  await mockAuthenticationApi(page);
  await page.goto(PROTECTED_ROUTE);
  await signIn(page);
});

When("I navigate to a protected frontend route", async ({ page }) => {
  await page.goto(PROTECTED_ROUTE);
});

When("I sign in through the frontend", async ({ page }) => {
  await signIn(page);
});

When("I sign out through the frontend", async ({ page }) => {
  await page.getByRole("button", { name: "Log out" }).click();
});

When("I reload the authenticated frontend", async ({ page }) => {
  await page.reload();
});

Then("the frontend login page should be visible", async ({ page }) => {
  await expect(page).toHaveURL(/\/login$/u);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

Then("the requested protected route should be visible", async ({ page }) => {
  await expect(page).toHaveURL(
    new RegExp(`${PROTECTED_ROUTE.replaceAll("/", "\\/")}$`, "u"),
  );
  await expect(page.getByLabel("Current user")).toContainText("Alice Example");
});

Then("authenticated frontend requests should contain the bearer token", () => {
  expect(authenticatedRequestObserved).toBe(true);
});

Then("the frontend logout endpoint should have been called", () => {
  expect(logoutRequestObserved).toBe(true);
});
