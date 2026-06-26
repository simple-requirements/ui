import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { expectStableScreenshot } from '../lib/expectStableScreenshot';

const { Given, Then, When } = createBdd(test);
const actionBar = (page: Page) => page.locator('.workspace-actionbar');

Given('clipboard writing succeeds', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copy key' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Copy visible key');

    await page.evaluate(() => {
        type ClipboardControlWindow = Window & { __workspaceUxClipboardShouldFail?: boolean };

        const controlledWindow = window as ClipboardControlWindow;
        controlledWindow.__workspaceUxClipboardShouldFail = false;

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: () =>
                    controlledWindow.__workspaceUxClipboardShouldFail === true ?
                        Promise.reject(new Error('denied'))
                    :   Promise.resolve(),
            },
        });
    });
});

When('clipboard writing fails', async ({ page }) => {
    await page.evaluate(() => {
        type ClipboardControlWindow = Window & { __workspaceUxClipboardShouldFail?: boolean };

        (window as ClipboardControlWindow).__workspaceUxClipboardShouldFail = true;
    });
});

When('I close the requirement tab {string}', async ({ page }, requirementKey: string) => {
    await page.getByRole('button', { name: `Close ${requirementKey}` }).click();
});

When('I enter {string} into the search field', async ({ page }, requirementKey: string) => {
    await page.getByRole('textbox', { name: 'Requirement key' }).fill(requirementKey);
});

When('I select requirement {string}', async ({ page }, requirementKey: string) => {
    const row = page.getByRole('row').filter({ hasText: requirementKey });

    await expect(row).toBeVisible();
    await row.click();
});

When('I select the first requirement that is not {string}', async ({ page }, requirementKey: string) => {
    const rows = page.locator('.req-list tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i += 1) {
        const row = rows.nth(i);
        const rowText = (await row.textContent()) ?? '';
        if (!rowText.includes(requirementKey)) {
            await row.click();
            return;
        }
    }

    throw new Error(`No selectable requirement row different from ${requirementKey} was found.`);
});

When(
    'I fill the {string} field in the {string} form with {string}',
    async ({ page }, fieldName: string, formHeading: string, value: string) => {
        const form = page.getByRole('form', { name: formHeading });
        await form.getByRole('textbox', { name: fieldName }).fill(value);
    },
);

Then('I see {string} copy feedback', async ({ page }, feedback: string) => {
    const elements = page.getByRole('status');
    const statusElement = elements.getByText(feedback);

    await expect(statusElement).toBeVisible();
});

Then('the requirements action bar controls are visible and aligned', async ({ page }) => {
    const bar = actionBar(page);

    const requirementKeyInput = bar.getByLabel('Requirement key');
    const findKeyButton = bar.getByRole('button', { name: 'Find key' });

    await expect(requirementKeyInput).toBeVisible();
    await expect(findKeyButton).toBeVisible();
    await expect(bar.getByRole('button', { name: 'New requirement' })).toBeVisible();

    const inputBox = await requirementKeyInput.boundingBox();
    const buttonBox = await findKeyButton.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    if (inputBox && buttonBox) expect(Math.abs(inputBox.height - buttonBox.height)).toBeLessThanOrEqual(1);

    await expectStableScreenshot(page, bar, 'workspace-ux-actionbar-separated-controls.png', {
        maxDiffPixelRatio: 0.01,
        threshold: 0.2,
    });
});

Then('the requirement tab {string} is visible', async ({ page }, requirementKey: string) => {
    await expect(page.getByRole('tab', { name: requirementKey })).toBeVisible();
    await expectStableScreenshot(page, page.locator('.app-tabs'), 'workspace-ux-requirement-tab-close.png', {
        maxDiffPixelRatio: 0.01,
        threshold: 0.2,
    });
});

Then('the requirement {string} is selected', async ({ page }, requirementKey: string) => {
    await expect(page.getByRole('row').filter({ hasText: requirementKey })).toHaveClass(/selected/);
});

Then('only the requirement {string} is selected', async ({ page }, requirementKey: string) => {
    const selectedRows = page.locator('.req-list tbody tr.selected');

    await expect(selectedRows).toHaveCount(1);
    await expect(selectedRows).toContainText(requirementKey);
});

Then('the requirement {string} checkbox is checked', async ({ page }, requirementKey: string) => {
    const row = page.getByRole('row').filter({ hasText: requirementKey });

    await expect(row.locator('input[type="checkbox"]')).toBeChecked();
});

Then('the {string} tab has no close button', async ({ page }, tabName: string) => {
    await expect(page.getByRole('button', { name: `Close ${tabName}` })).toHaveCount(0);
});

Then('the {string} tab is active', async ({ page }, tabName: string) => {
    await expect(page.getByRole('tab', { name: tabName })).toHaveAttribute('aria-selected', 'true');
});

Then('a toast message says {string}', async ({ page }, message: string) => {
    await expect(page.locator('.p-toast-message').filter({ hasText: message })).toBeVisible();
});

Then('the project unavailable action-bar text is not visible', async ({ page }) => {
    await expect(actionBar(page)).not.toContainText('Select a project to continue.');
});

Then('the description editor mode buttons use active primary and inactive secondary outlines', async ({ page }) => {
    const form = page.getByRole('form', { name: 'New requirement' });
    const codeButton = form.getByRole('button', { name: 'Code' });
    const visualButton = form.getByRole('button', { name: 'Visual' });

    await expect(codeButton).toBeVisible();
    await expect(codeButton).toHaveClass(/p-button-outlined/);
    await expect(codeButton).not.toHaveClass(/p-button-secondary/);
    await expect(visualButton).toBeVisible();
    await expect(visualButton).toHaveClass(/p-button-outlined/);
    await expect(visualButton).toHaveClass(/p-button-secondary/);
});

Then('the requirement detail category is {string}', async ({ page }, categoryKey: string) => {
    const definitionList = page.locator('.requirement-detail__definition-list').first();

    await expect(definitionList).toContainText('Category');
    await expect(definitionList).toContainText(categoryKey);
    await expect(definitionList).not.toContainText(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
});

Then('the read-only requirement detail does not show description mode buttons', async ({ page }) => {
    const detail = page.locator('.requirement-detail').first();
    await expect(detail.getByRole('button', { name: 'Code' })).toHaveCount(0);
    await expect(detail.getByRole('button', { name: 'Visual' })).toHaveCount(0);
});

Then('the confirmation dialog {string} is visible', async ({ page }, title: string) => {
    await expect(page.getByRole('dialog', { name: title })).toBeVisible();
});

When('I cancel the confirmation dialog', async ({ page }) => {
    await page.getByRole('dialog').last().getByRole('button', { name: 'Cancel' }).click();
});

Then(
    'the {string} field in the {string} form contains {string}',
    async ({ page }, fieldName: string, formHeading: string, value: string) => {
        const form = page.getByRole('form', { name: formHeading });
        await expect(form.getByRole('textbox', { name: fieldName })).toHaveValue(value);
    },
);

Then('the requirement edit form heading is {string}', async ({ page }, requirementKey: string) => {
    const form = page.getByRole('form', { name: requirementKey });

    await expect(form.getByRole('heading', { name: requirementKey })).toBeVisible();
});
