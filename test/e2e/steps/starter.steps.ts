import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Given, Then, When } = createBdd(test);

const ordinalIndexByWord: Record<string, number> = {
    first: 0,
    second: 1,
    third: 2,
};

Given('I open the demo workspace', async ({ page }) => {
    await page.goto('/');
});

Then('the startup overlay disappears', async ({ page }) => {
    await expect(page.getByRole('status', { name: 'Loading application' })).toBeHidden({ timeout: 3000 });
});

Then('{int} demo projects are visible', async ({ page }, projectCount: number) => {
    await expect(page.getByRole('button', { name: /Requirements Platform/ })).toBeVisible();
    await expect(page.locator('.project-row')).toHaveCount(projectCount);
});

When('I double click the {word} requirement', async ({ page }, ordinal: string) => {
    const requirementIndex = ordinalIndexByWord[ordinal] ?? 0;
    await page.locator('.req-list tbody tr').nth(requirementIndex).dblclick();
});

Then('{int} dedicated requirement tab is visible', async ({ page }, tabCount: number) => {
    await expect(page.getByRole('tab').filter({ hasText: /FR-|NFR-/ })).toHaveCount(tabCount);
    await expect(page.locator('.dedicated')).toBeVisible();
});
