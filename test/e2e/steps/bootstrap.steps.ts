import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { publicRequestJson } from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

let registrationAvailable: boolean | undefined;

Given('the real bootstrap API is available', async () => {
    const status = await publicRequestJson<{ registrationAvailable: boolean }>('/auth/bootstrap/status', {}, 200);
    registrationAvailable = status.registrationAvailable;
});

When('I open the frontend authentication entry', async ({ page }) => {
    await page.goto('/login');
});

Then('either the initial Administrator form or the sign-in form should be visible', async ({ page }) => {
    if (registrationAvailable === true) {
        await expect(page.getByRole('heading', { name: 'Create initial Administrator' })).toBeVisible();
        await expect(page.getByLabel('Bootstrap secret')).toBeVisible();
        return;
    }

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

Then('the initial Administrator form should be visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create initial Administrator' })).toBeVisible();
});

Then('the initial Administrator email-verification instruction should be visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
});

Then('the completed-bootstrap notice should be visible', async ({ page }) => {
    await expect(page.getByRole('status')).toContainText('has already been completed');
});
