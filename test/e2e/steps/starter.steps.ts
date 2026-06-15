import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Given, Then, When } = createBdd(test);

Given('I open the demo workspace', async ({ page }) => {
    await page.goto('/');
});

Then('the startup overlay disappears', async ({ page }) => {
    await expect(page.getByRole('status', { name: 'Loading application' })).toBeHidden({ timeout: 3000 });
});

Then('eight demo projects are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Requirements Platform/ })).toBeVisible();
    await expect(page.locator('.project-row')).toHaveCount(8);
});

When('I double click the first requirement', async ({ page }) => {
    await page.locator('.req-list tbody tr').first().dblclick();
});

Then('a dedicated requirement tab is visible', async ({ page }) => {
    await expect(page.getByRole('tab').filter({ hasText: /FR-|NFR-/ })).toHaveCount(1);
    await expect(page.locator('.dedicated')).toBeVisible();
});
