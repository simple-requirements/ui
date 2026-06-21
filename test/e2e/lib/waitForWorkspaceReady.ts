import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const waitForWorkspaceReady = async (page: Page) => {
    await expect(page.getByRole('status', { name: 'Loading application' })).toBeHidden({ timeout: 5000 });
    await expect(page.locator('.project-row').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'New requirement' })).toBeEnabled({ timeout: 5000 });
    await page.evaluate(() => document.fonts.ready);
};
