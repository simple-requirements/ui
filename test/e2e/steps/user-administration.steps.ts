import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import {
    E2E_ADMIN_USER_ID,
    listUserSessions,
    openAuthenticatedRoute,
    requireBackendAvailable,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

Given('a real frontend Administrator session is available', async () => {
    await requireBackendAvailable();
});

When('I open frontend user administration as a real Administrator', async ({ page }) => {
    await openAuthenticatedRoute(page, '/administration/users');
    await expect(page).toHaveURL(/\/administration\/users$/u);
});

When('I select the E2E Administrator user', async ({ page }) => {
    await page.getByRole('button', { name: /E2E Requirements Engineer/iu }).click();
});

Then('the selected user sessions should be visible', async ({ page }) => {
    const sessions = await listUserSessions(E2E_ADMIN_USER_ID);
    expect(sessions.length).toBeGreaterThan(0);
    await expect(page.getByRole('table', { name: /Sessions for/iu })).toBeVisible();
});
