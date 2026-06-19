import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { clearBrowserStateBeforeNavigation } from '../lib/clearBrowserStateBeforeNavigation';
import { expectStableScreenshot } from '../lib/expectStableScreenshot';
import { expectVisibleAndEnabled } from '../lib/expectVisibleAndEnabled';
import { formWithHeading } from '../lib/formWithHeading';
import { normalizeClick, type ClickAction } from '../lib/normalizeClick';
import { waitForWorkspaceReady } from '../lib/waitForWorkspaceReady';

const { Given, Then, When } = createBdd(test);

const actionBar = (page: Page) => page.locator('.workspace-actionbar');

const slug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

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

Given('the workspace layout is open', async ({ page }) => {
    await clearBrowserStateBeforeNavigation(page);
    await page.goto('/');
    await waitForWorkspaceReady(page);
});

Given('the workspace application is starting', async ({ page }) => {
    await clearBrowserStateBeforeNavigation(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
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

When(
    'I open the dropdown identified by {string} in the {string} form',
    async ({ page }, testid: string, formHeading: string) => {
        await formWithHeading(page, formHeading).getByTestId(testid).click();
        await expect(page.getByLabel('Option List').getByText('AUTH — Authentication — FR')).toBeVisible();
    },
);

When('I select requirement {string}', async ({ page }, requirementKey: string) => {
    const row = page.getByRole('row').filter({ hasText: requirementKey });

    await expect(row).toBeVisible();
    await row.click();
});

When('I select the {string} category option', async ({ page }, optionName: string) => {
    await page.getByRole('option', { name: optionName }).click();
});

When('I select {string} in the {string} form', async ({ page }, optionName: string, formHeading: string) => {
    await formWithHeading(page, formHeading).locator('label').filter({ hasText: optionName }).click();
});

When('I submit the {string} form with {string}', async ({ page }, formHeading: string, projectName: string) => {
    const form = formWithHeading(page, formHeading);

    await form.getByLabel('Project name').fill(projectName);
    await form.getByRole('button', { name: 'Create' }).click();
});

When('I {string} on requirement {string}', async ({ page }, action: ClickAction, requirementKey: string) => {
    const clickAction = normalizeClick(action);
    const row = page.getByRole('row').filter({ hasText: requirementKey });

    await row[clickAction]();
});

When('I {string} on {string} project', async ({ page }, action: ClickAction, project: string) => {
    const selectedProject = page.getByRole('button', { name: project });
    const clickAction = normalizeClick(action);

    await selectedProject[clickAction]();
});

When('I {string} on the {string} button', async ({ page }, action: ClickAction, name: string) => {
    const button = page.getByRole('button', { name });
    const clickAction = normalizeClick(action);

    await button[clickAction]();
});

When('I {string} on the {int}st requirement', async ({ page }, action: ClickAction, requirementIndex: number) => {
    const clickAction = normalizeClick(action);
    const row = page.locator('.req-list tbody tr').nth(requirementIndex - 1);

    await row[clickAction]();
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

Then('I see a user-safe error message: {string}', async ({ page }, errorMessage: string) => {
    const form = formWithHeading(page, 'New Project');

    await expect(form.getByRole('alert')).toHaveText(errorMessage);
    await expectStableScreenshot(page, form, 'workspace-ux-new-project-safe-error.png', {
        maxDiffPixelRatio: 0.01,
        threshold: 0.2,
    });
});

Then('I see {string} copy feedback', async ({ page }, feedback: string) => {
    const elements = page.getByRole('status');
    const statusElement = elements.getByText(feedback);

    await expect(statusElement).toBeVisible();
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

Then('the first requirement is selected', async ({ page }) => {
    const firstRow = page.getByRole('table').getByRole('row').nth(1);

    await expect(firstRow).toHaveClass(/selected/);
});

Then('the loading overlay is visible', async ({ page }) => {
    await expect(page.getByText(/Loading demo workspace/i)).toBeVisible();
});

Then('the requirements action bar controls are visible and aligned', async ({ page }) => {
    const bar = actionBar(page);

    await expect(bar.getByLabel('Requirement key')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Find key' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'New requirement' })).toBeVisible();

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

Then('the {string} action is selected', async ({ page }, action: string) => {
    const moduleNav = page.getByRole('navigation');
    const selectedAction = moduleNav.getByRole('button', { name: action });

    await expect(selectedAction).toHaveClass(/active/);
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

Then('the {string} project is selected', async ({ page }, project: string) => {
    await expect(page.getByRole('button', { name: project })).toHaveAttribute('aria-current', 'true');
});

Then(
    'the {string} radio group in the {string} form is labelled',
    async ({ page }, groupName: string, formHeading: string) => {
        await expect(formWithHeading(page, formHeading).getByRole('group', { name: groupName })).toBeVisible();
    },
);

Then('the {string} tab has no close button', async ({ page }, tabName: string) => {
    await expect(page.getByRole('button', { name: `Close ${tabName}` })).toHaveCount(0);
});

Then('the {string} tab is active', async ({ page }, tabName: string) => {
    await expect(page.getByRole('tab', { name: tabName })).toHaveAttribute('aria-selected', 'true');
});

Then('{int} dedicated requirement tab is visible', async ({ page }, tabCount: number) => {
    await expect(page.getByRole('tab').filter({ hasText: /FR-|NFR-/ })).toHaveCount(tabCount);
    await expect(page.locator('.dedicated')).toBeVisible();
});

Then('{int} demo projects are visible', async ({ page }, projectCount: number) => {
    await expect(page.locator('.project-row')).toHaveCount(projectCount);
});
