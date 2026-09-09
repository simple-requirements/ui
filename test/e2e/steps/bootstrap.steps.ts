import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";

const { Given, When, Then } = createBdd(test);

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:3000";

async function mockBootstrapApi(
  page: Page,
  concurrentCompletion: boolean,
): Promise<void> {
  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname === "/auth/bootstrap/status") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ registrationAvailable: true }),
      });
      return;
    }

    if (pathname === "/auth/bootstrap/administrator") {
      await route.fulfill({
        status: concurrentCompletion ? 409 : 202,
        contentType: "application/json",
        body: JSON.stringify(
          concurrentCompletion
            ? { message: "Bootstrap registration is not available." }
            : { message: "Bootstrap registration received." },
        ),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: "{}",
    });
  });
}

async function fillBootstrapForm(page: Page): Promise<void> {
  await page.getByLabel("Username").fill("administrator");
  await page.getByLabel("Email address").fill("admin@example.org");
  await page.getByLabel("Display name").fill("Initial Administrator");
  await page
    .getByLabel("Password", { exact: true })
    .fill("correct horse battery staple");
  await page
    .getByLabel("Confirm password")
    .fill("correct horse battery staple");
  await page.getByLabel("Bootstrap secret").fill("setup-secret");
}

Given(
  "initial Administrator bootstrap is available to the frontend",
  async ({ page }) => {
    await mockBootstrapApi(page, false);
  },
);

Given(
  "initial Administrator bootstrap becomes unavailable during frontend registration",
  async ({ page }) => {
    await mockBootstrapApi(page, true);
  },
);

When("I open the frontend authentication entry", async ({ page }) => {
  await page.goto("/login");
});

When(
  "I register the initial Administrator through the frontend",
  async ({ page }) => {
    await fillBootstrapForm(page);
    await page.getByRole("button", { name: "Create Administrator" }).click();
  },
);

When("I continue from initial Administrator registration", async ({ page }) => {
  await page.getByRole("button", { name: "Continue to sign in" }).click();
});

Then("the initial Administrator form should be visible", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Create initial Administrator" }),
  ).toBeVisible();
  await expect(page.getByLabel("Bootstrap secret")).toBeVisible();
});

Then(
  "the initial Administrator email-verification instruction should be visible",
  async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    await expect(
      page.getByText("Verify the email address before signing in.", {
        exact: false,
      }),
    ).toBeVisible();
  },
);

Then("the completed-bootstrap notice should be visible", async ({ page }) => {
  await expect(page.getByRole("status")).toContainText(
    "has already been completed",
  );
});
