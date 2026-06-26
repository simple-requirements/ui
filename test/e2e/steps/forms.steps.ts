import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { expectStableScreenshot } from '../lib/expectStableScreenshot';
import { formWithHeading } from '../lib/formWithHeading';

const { Then, When } = createBdd(test);

const slug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

When(
    'I open the dropdown identified by {string} in the {string} form',
    async ({ page }, testid: string, formHeading: string) => {
        await formWithHeading(page, formHeading).getByTestId(testid).click();
        await expect(page.getByLabel('Option List').getByText('AUTH — Authentication — FR')).toBeVisible();
    },
);

When('I select the {string} category option', async ({ page }, optionName: string) => {
    await page.getByRole('option', { name: optionName }).click();
});

When('I select {string} in the {string} form', async ({ page }, optionName: string, formHeading: string) => {
    await formWithHeading(page, formHeading).locator('label').filter({ hasText: optionName }).click();
});

Then('all fields in the {string} form remain aligned', async ({ page }, formHeading: string) => {
    const form = formWithHeading(page, formHeading);
    await expectStableScreenshot(page, form, `workspace-ux-${slug(formHeading)}-fields-aligned-desktop.png`, {
        maxDiffPixelRatio: 0.02,
        threshold: 0.2,
    });
});

Then('category options include {string}', async ({ page }, optionName: string) => {
    await expect(page.getByRole('option', { name: optionName })).toBeVisible();
});

Then('only {string} is selected in the {string} form', async ({ page }, optionName: string, formHeading: string) => {
    const form = formWithHeading(page, formHeading);
    const alternate = optionName === 'Non-functional (NFR)' ? 'Functional (FR)' : 'Non-functional (NFR)';

    await expect(form.getByRole('radio', { name: optionName })).toBeChecked();
    await expect(form.getByRole('radio', { name: alternate })).not.toBeChecked();
});

Then('the derived type is {string} in the {string} form', async ({ page }, type: string, formHeading: string) => {
    const form = formWithHeading(page, formHeading);

    await expect(form.getByText(`Derived type: ${type}`)).toBeVisible();
    await expect(page.locator('.p-dropdown-panel')).toBeHidden();
});

Then(
    'the {string} field in the {string} form is required and labelled',
    async ({ page }, fieldName: string, formHeading: string) => {
        await expect(formWithHeading(page, formHeading).getByText(`${fieldName} *`)).toBeVisible();
    },
);

Then('the {string} form controls are aligned', async ({ page }, formHeading: string) => {
    const form = formWithHeading(page, formHeading);

    await expect(form.getByLabel('Project name')).toBeVisible();
    await expect(form.locator('.form__actions')).toBeVisible();
    await expectStableScreenshot(page, form, `workspace-ux-form-aligned.png`, {
        maxDiffPixelRatio: 0.01,
        threshold: 0.2,
    });
});

Then('the {string} form action buttons use success and danger colors', async ({ page }, formHeading: string) => {
    const form = formWithHeading(page, formHeading);
    const createButton = form.getByRole('button', { name: 'Create' });
    const cancelButton = form.getByRole('button', { name: 'Cancel' });

    await expect(createButton).toHaveClass(/p-button-success/);
    await expect(cancelButton).toHaveClass(/p-button-danger/);
});

Then('the {string} form action buttons are aligned to the right', async ({ page }, formHeading: string) => {
    const actions = formWithHeading(page, formHeading).locator('.form__actions');

    await expect(actions).toHaveCSS('justify-content', 'flex-end');
});

Then(
    'the {string} form shows active project {string}',
    async ({ page }, formHeading: string, activeProjectName: string) => {
        const form = formWithHeading(page, formHeading);

        await expect(form).toContainText(`Project: ${activeProjectName}`);
        await expect(form.getByLabel(/Title/i)).toHaveCount(0);
        await expect(form.getByLabel(/^Type$/i)).toHaveCount(0);
    },
);

Then(
    'the {string} field in the {string} form is labelled',
    async ({ page }, fieldName: string, formHeading: string) => {
        await expect(formWithHeading(page, formHeading).getByLabel(fieldName)).toBeVisible();
    },
);

Then(
    'the {string} radio group in the {string} form is labelled',
    async ({ page }, groupName: string, formHeading: string) => {
        await expect(formWithHeading(page, formHeading).getByRole('group', { name: groupName })).toBeVisible();
    },
);
