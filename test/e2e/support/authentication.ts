import { expect, type Page } from "@playwright/test";

import { E2E_LOGIN_PASSWORD, E2E_LOGIN_USERNAME } from "./e2eEnv";
import { publicRequestJson, requestJson } from "./realBackendClient";

export async function requireBackendAvailable(): Promise<void> {
  await publicRequestJson<unknown>("/auth/bootstrap/status", {}, 200);
  await requestJson<unknown>("/auth/me", {}, 200);
}

export async function requireRealBackendAvailable(): Promise<void> {
  await requireBackendAvailable();
}

export async function signInToRealBackend(
  page: Page,
  username = E2E_LOGIN_USERNAME,
  password = E2E_LOGIN_PASSWORD,
): Promise<void> {
  const currentUser = page.getByLabel("Current user");
  if (await currentUser.isVisible().catch(() => false)) {
    return;
  }

  const bootstrapForm = page.getByRole("heading", {
    name: "Create initial Administrator",
  });
  if (await bootstrapForm.isVisible().catch(() => false)) {
    throw new Error(
      "The real backend reports that initial Administrator bootstrap is still available. Run `pnpm seed:demo` from the backend after applying the seed fix so authentication bootstrap is marked complete.",
    );
  }

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toHaveCount(0, {
    timeout: 10_000,
  });
}

export async function openAuthenticatedRoute(
  page: Page,
  route = "/",
): Promise<void> {
  await requireRealBackendAvailable();
  await page.goto(route);
  await signInToRealBackend(page);
  await expect(page.getByLabel("Current user")).toBeVisible({ timeout: 10_000 });
}

export async function signInToTestApplication(page: Page): Promise<void> {
  await openAuthenticatedRoute(page, "/");
}
