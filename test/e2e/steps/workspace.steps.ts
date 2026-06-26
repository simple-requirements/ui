import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { clearBrowserStateBeforeNavigation } from '../lib/clearBrowserStateBeforeNavigation';
import { normalizeClick, type ClickAction } from '../lib/normalizeClick';
import { waitForWorkspaceReady } from '../lib/waitForWorkspaceReady';

const { Given, Then, When } = createBdd(test);

Given('the workspace layout is open', async ({ page }) => {
    await clearBrowserStateBeforeNavigation(page);
    await page.goto('/');
    await waitForWorkspaceReady(page);
});

Given('the workspace application is starting', async ({ page }) => {
    await clearBrowserStateBeforeNavigation(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
});

When('I {string} on the {string} button', async ({ page }, action: ClickAction, name: string) => {
    const button = page.getByRole('button', { name });
    const clickAction = normalizeClick(action);

    await button[clickAction]();
});

Then('the {string} action is selected', async ({ page }, action: string) => {
    const moduleNav = page.getByRole('navigation');
    const selectedAction = moduleNav.getByRole('button', { name: action });

    await expect(selectedAction).toHaveClass(/active/);
});

Then('the first project in the list is selected', async ({ page }) => {
    await expect(page.locator('.project-row').first()).toHaveAttribute('aria-current', 'true');
});

Then('the first requirement is selected', async ({ page }) => {
    const firstRow = page.getByRole('table').getByRole('row').nth(1);

    await expect(firstRow).toHaveClass(/selected/);
});

Then('the loading overlay is visible', async ({ page }) => {
    await expect(page.getByText(/Loading workspace/i)).toBeVisible();
});
