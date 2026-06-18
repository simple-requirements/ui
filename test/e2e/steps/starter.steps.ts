import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Given, Then, When } = createBdd(test);

const ordinalIndexByWord: Record<string, number> = { first: 0, second: 1, third: 2 };

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

Then('the New Project button label is centered', async ({ page }) => {
    const button = page.getByRole('button', { name: 'New Project' });
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    const labelBox = await button.locator('.p-button-label').boundingBox();
    expect(box).not.toBeNull();
    expect(labelBox).not.toBeNull();
    if (!box || !labelBox) return;
    const buttonCenterY = box.y + box.height / 2;
    const labelCenterY = labelBox.y + labelBox.height / 2;
    const buttonCenterX = box.x + box.width / 2;
    const labelCenterX = labelBox.x + labelBox.width / 2;
    expect(Math.abs(buttonCenterY - labelCenterY)).toBeLessThanOrEqual(2);
    expect(Math.abs(buttonCenterX - labelCenterX)).toBeLessThanOrEqual(2);
});

When('I open a new requirement form', async ({ page }) => {
    await page.getByRole('button', { name: 'New requirement' }).click();
});

Then('the complete New Requirement form is visible without pane-level scroll glitches', async ({ page }) => {
    const form = page.locator('form.requirement-form');
    await expect(form.getByRole('heading', { name: 'New requirement' })).toBeVisible();
    await expect(form.getByLabel('Category')).toBeVisible();
    await expect(form.getByText(/Derived type:/)).toBeVisible();
    await expect(form.getByLabel('Description')).toBeVisible();
    await expect(form.getByLabel('Priority')).toBeVisible();
    await expect(form.getByLabel('Owner')).toBeVisible();
    await expect(form.getByLabel('Rationale')).toBeVisible();
    await expect(form.getByLabel('Source')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Create requirement' })).toBeVisible();
    await expect(form.getByRole('button', { name: 'Cancel' })).toBeVisible();

    const formBox = await form.boundingBox();
    const rightPaneBox = await page.locator('.right-pane').boundingBox();
    const headingBox = await form.getByRole('heading', { name: 'New requirement' }).boundingBox();
    const categoryBox = await form.getByLabel('Category').boundingBox();
    const descriptionBox = await form.getByLabel('Description').boundingBox();
    const actionsBox = await form.locator('.form__actions').boundingBox();
    expect(formBox).not.toBeNull();
    expect(rightPaneBox).not.toBeNull();
    expect(headingBox).not.toBeNull();
    expect(categoryBox).not.toBeNull();
    expect(descriptionBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    if (!formBox || !rightPaneBox || !headingBox || !categoryBox || !descriptionBox || !actionsBox) return;
    expect(formBox.height).toBeGreaterThan(rightPaneBox.height / 2);
    expect(categoryBox.y).toBeGreaterThan(headingBox.y + headingBox.height);
    expect(descriptionBox.y).toBeGreaterThan(categoryBox.y + categoryBox.height);
    expect(actionsBox.y).toBeGreaterThan(descriptionBox.y + descriptionBox.height);
});
