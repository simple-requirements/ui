import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";

const { Given, When, Then } = createBdd(test);

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:3000";

let registrationBody: unknown;
let verificationTokens: unknown[] = [];
let passwordResetBody: unknown;

async function mockPublicAccountApi(page: Page): Promise<void> {
  registrationBody = undefined;
  verificationTokens = [];
  passwordResetBody = undefined;

  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (pathname === "/auth/register") {
      registrationBody = request.postDataJSON();
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ message: "Accepted." }),
      });
      return;
    }

    if (pathname === "/auth/email-verification/confirm") {
      verificationTokens.push(request.postDataJSON());
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (pathname === "/auth/email-verification/resend") {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ message: "Accepted." }),
      });
      return;
    }

    if (pathname === "/auth/password-reset/request") {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ message: "Accepted." }),
      });
      return;
    }

    if (pathname === "/auth/password-reset/confirm") {
      passwordResetBody = request.postDataJSON();
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: "Not found." }),
    });
  });
}

Given("the public account API is available", async ({ page }) => {
  await mockPublicAccountApi(page);
});

When("I register a local frontend account", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Username").fill(" alice ");
  await page.getByLabel("Email address").fill(" ALICE@Example.org ");
  await page.getByLabel("Display name").fill(" Alice Example ");
  await page
    .getByLabel("Password", { exact: true })
    .fill("correct horse battery staple");
  await page
    .getByLabel("Confirm password")
    .fill("correct horse battery staple");
  await page.getByRole("button", { name: "Register" }).click();
});

Then("the registration instructions should be visible", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Registration received" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "Administrator must activate",
  );
});

Then("the normalized registration data should have been submitted", () => {
  expect(registrationBody).toEqual({
    username: "alice",
    email: "alice@example.org",
    displayName: "Alice Example",
    password: "correct horse battery staple",
  });
});

When("I open a frontend email-verification link", async ({ page }) => {
  await page.goto("/verify-email?token=verification-token");
});

Then(
  "the email-verification confirmation should be visible",
  async ({ page }) => {
    await expect(page.getByRole("status")).toContainText("has been verified");
  },
);

Then("the verification token should have been submitted once", () => {
  expect(verificationTokens).toEqual([{ token: "verification-token" }]);
});

When("I request another frontend verification email", async ({ page }) => {
  await page.goto("/verify-email/resend");
  await page.getByLabel("Username").fill("alice");
  await page.getByRole("button", { name: "Send verification email" }).click();
});

Then(
  "the generic verification-email response should be visible",
  async ({ page }) => {
    await expect(page.getByRole("status")).toContainText(
      "If the account is eligible",
    );
  },
);

When("I request a frontend password reset", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill("alice@example.org");
  await page.getByRole("button", { name: "Send reset email" }).click();
});

Then(
  "the generic password-reset response should be visible",
  async ({ page }) => {
    await expect(page.getByRole("status")).toContainText(
      "If the account is eligible",
    );
  },
);

When("I open a frontend password-reset link", async ({ page }) => {
  await page.goto("/reset-password?token=reset-token");
});

When("I submit a new frontend password", async ({ page }) => {
  await page
    .getByLabel("New password", { exact: true })
    .fill("new correct horse battery staple");
  await page
    .getByLabel("Confirm new password")
    .fill("new correct horse battery staple");
  await page.getByRole("button", { name: "Change password" }).click();
});

Then("the password-change confirmation should be visible", async ({ page }) => {
  await expect(page.getByRole("status")).toContainText(
    "Existing sessions have been revoked",
  );
});

Then("the password-reset token should have been submitted", () => {
  expect(passwordResetBody).toEqual({
    token: "reset-token",
    password: "new correct horse battery staple",
  });
});
