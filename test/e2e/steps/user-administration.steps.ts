import { expect } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";
import {
  openAuthenticatedRoute,
  requireBackendAvailable,
} from "./authenticated-test-backend";

const { Given, When, Then } = createBdd(test);

Given("a real frontend Administrator session is available", async () => {
  await requireBackendAvailable();
});

When(
  "I open frontend user administration as a real Administrator",
  async ({ page }) => {
    await openAuthenticatedRoute(page, "/admin/users");
    await expect(page).toHaveURL(/\/admin\/users$/u);
  },
);

When("I select the Administrator user", async ({ page }) => {
  await page.getByRole("link", { name: "Administrator", exact: true }).click();
});

Then(
  "the selected user account details should be visible",
  async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Administrator" }),
    ).toBeVisible();
    await expect(page.getByText("@administrator")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Administrator" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sessions" })).toHaveCount(
      0,
    );
  },
);
