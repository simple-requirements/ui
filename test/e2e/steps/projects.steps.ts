import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { formWithHeading } from '../lib/formWithHeading';
import { normalizeClick, type ClickAction } from '../lib/normalizeClick';

const { Then, When } = createBdd(test);
const createdProjectNameByPage = new WeakMap<object, string>();

When('I {string} on {string} project', async ({ page }, action: ClickAction, project: string) => {
    const selectedProject = page.getByRole('button', { name: project });
    const clickAction = normalizeClick(action);

    await selectedProject[clickAction]();
});

When('I submit the {string} form with a unique cleanup project name', async ({ page }, formHeading: string) => {
    const projectName = `E2E Cleanup Project ${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const form = formWithHeading(page, formHeading);

    createdProjectNameByPage.set(page, projectName);
    await form.getByLabel('Project name').fill(projectName);
    await form.getByRole('button', { name: 'Create' }).click();
});

When('I {string} on the {int}st requirement', async ({ page }, action: ClickAction, requirementIndex: number) => {
    const clickAction = normalizeClick(action);
    const row = page.locator('.req-list tbody tr').nth(requirementIndex - 1);

    await row[clickAction]();
});

Then('the {string} project is selected', async ({ page }, project: string) => {
    await expect(page.getByRole('button', { name: project })).toHaveAttribute('aria-current', 'true');
});

Then('the created cleanup project is visible in the sidebar', async ({ page }) => {
    const projectName = createdProjectNameByPage.get(page);
    if (!projectName) throw new Error('No cleanup project was created by this scenario.');

    await expect(page.getByRole('button', { name: projectName })).toBeVisible();
});

Then('{int} dedicated requirement tab is visible', async ({ page }, tabCount: number) => {
    await expect(page.getByRole('tab').filter({ hasText: /FR-|NFR-/ })).toHaveCount(tabCount);
    await expect(page.locator('.dedicated')).toBeVisible();
});

Then('{int} projects are visible', async ({ page }, projectCount: number) => {
    await expect(page.locator('.project-row')).toHaveCount(projectCount);
});


When('I cancel the {string} form', async ({ page }, formHeading: string) => {
    await formWithHeading(page, formHeading).getByRole('button', { name: 'Cancel' }).click();
});

When('I click {string} in the {string} form', async ({ page }, buttonName: string, formHeading: string) => {
    await formWithHeading(page, formHeading).getByRole('button', { name: buttonName }).click();
});

Then('the {string} form is closed', async ({ page }, formHeading: string) => {
    await expect(formWithHeading(page, formHeading)).toHaveCount(0);
});

Then('the {string} field reports a missing value in the {string} form', async ({ page }, fieldName: string, formHeading: string) => {
    const field = formWithHeading(page, formHeading).getByRole('textbox', { name: fieldName });
    const validationMessage = await field.evaluate((element) => (element as HTMLInputElement).validationMessage);

    expect(validationMessage.length).toBeGreaterThan(0);
});

Then('the {string} project is visible in the sidebar', async ({ page }, projectName: string) => {
    await expect(page.getByRole('button', { name: projectName })).toBeVisible();
});
