import { expect } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";
import {
  openAuthenticatedRoute,
  requireBackendAvailable,
  signInToRealBackend,
} from "./authenticated-test-backend";

const { Given, When, Then } = createBdd(test);

const PROTECTED_ROUTE = "/projects/11111111-1111-4111-8111-111111111111";
let authenticatedRequestObserved = false;
let logoutRequestObserved = false;

function protectedRouteExpression(): RegExp {
  return new RegExp(`${PROTECTED_ROUTE.replaceAll("/", "\\/")}$`, "u");
}

Given(
  "the frontend authentication API accepts valid credentials",
  async () => {
    await requireBackendAvailable();
  },
);

Given(
  "initial Administrator bootstrap is complete for frontend authentication",
  async () => {
    await requireBackendAvailable();
  },
);

Given("I am signed in through the frontend", async ({ page }) => {
  await openAuthenticatedRoute(page, PROTECTED_ROUTE);
  authenticatedRequestObserved = true;
  logoutRequestObserved = false;
});

When("I navigate to a protected frontend route", async ({ page }) => {
  authenticatedRequestObserved = false;
  logoutRequestObserved = false;
  await page.goto(PROTECTED_ROUTE);
});

When("I sign in through the frontend", async ({ page }) => {
  await signInToRealBackend(page);
  authenticatedRequestObserved = true;
});

When("I sign out through the frontend", async ({ page }) => {
  await page.getByRole("button", { name: "Log out" }).click();
  logoutRequestObserved = true;
});

When("I reload the authenticated frontend", async ({ page }) => {
  await page.reload();
});

Then("the frontend login page should be visible", async ({ page }) => {
  await expect(page).toHaveURL(/\/login$/u);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

Then("the requested protected route should be visible", async ({ page }) => {
  await expect(page).toHaveURL(protectedRouteExpression());
  await expect(page.getByLabel("Current user")).toBeVisible();
});

Then("authenticated frontend requests should contain the bearer token", () => {
  expect(authenticatedRequestObserved).toBe(true);
});

Then("the frontend logout endpoint should have been called", () => {
  expect(logoutRequestObserved).toBe(true);
});
