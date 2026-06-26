import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Then, When } = createBdd(test);

const contextMenu = (page: Page) => page.locator('.p-contextmenu').last();
const exportDialog = (page: Page, title: string) => page.getByRole('dialog', { name: title });

When('I open the context menu for {string} project', async ({ page }, projectName: string) => {
    await page.getByRole('button', { name: projectName }).click({ button: 'right' });
});

When('I open the context menu for requirement {string}', async ({ page }, requirementKey: string) => {
    const row = page.getByRole('row').filter({ hasText: requirementKey });

    await expect(row).toBeVisible();
    await row.click({ button: 'right' });
});

When('I choose {string} from the context menu', async ({ page }, menuItem: string) => {
    const item = contextMenu(page).getByText(menuItem, { exact: true });

    await expect(item).toBeVisible();
    await item.click();
});

Then('the context menu offers {string}', async ({ page }, menuItem: string) => {
    await expect(contextMenu(page).getByText(menuItem, { exact: true })).toBeVisible();
});

Then('the export dialog {string} is visible', async ({ page }, title: string) => {
    await expect(exportDialog(page, title)).toBeVisible();
});

Then('the export dialog offers {string}', async ({ page }, formatLabel: string) => {
    await expect(page.locator('#export-format option').filter({ hasText: formatLabel })).toHaveCount(1);
});
