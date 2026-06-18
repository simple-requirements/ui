import { expect, type Locator, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Given, Then, When } = createBdd(test);

const desktop = { width: 1440, height: 900 };
const narrow = { width: 1024, height: 768 };

type Box = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

const box = async (locator: Locator): Promise<Box> => {
    await expect(locator).toBeVisible();
    const bounds = await locator.boundingBox();
    expect(bounds).not.toBeNull();
    return bounds as Box;
};

const expectPositiveGap = (left: Box, right: Box) => {
    expect(right.x - (left.x + left.width)).toBeGreaterThan(0);
};

const overlaps = (a: Box, b: Box) =>
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

const expectNoOverlap = (a: Box, b: Box) => {
    expect(overlaps(a, b)).toBe(false);
};

const expectUsableButton = async (button: Locator) => {
    const bounds = await box(button);
    expect(bounds.height).toBeGreaterThanOrEqual(32);
    expect(bounds.width).toBeGreaterThan(48);
};

const formWithHeading = (page: Page, heading: string) =>
    page.locator('form').filter({ has: page.getByRole('heading', { name: heading }) });

const actionBar = (page: Page) => page.locator('.workspace-actionbar');

const waitForWorkspaceReady = async (page: Page) => {
    await expect(page.getByRole('status', { name: 'Loading application' })).toBeHidden({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Requirements Platform/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New requirement' })).toBeEnabled({ timeout: 5000 });
    await page.evaluate(() => document.fonts.ready);
};

Given('the workspace layout is open', async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.goto('/');
    await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
    });
    await page.reload();
    await waitForWorkspaceReady(page);
});

Given('a valid project is selected', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Requirements Platform/ })).toHaveAttribute('aria-pressed', 'true');
});

When('I open the New Project form', async ({ page }) => {
    await page.getByRole('button', { name: 'New Project' }).click();
    await expect(formWithHeading(page, 'New Project')).toBeVisible();
});

When('project creation is unavailable because the backend contract does not support it', async ({ page }) => {
    const form = formWithHeading(page, 'New Project');
    await form.getByLabel('Project name').fill('Contract Gap Project');
    await form.getByRole('button', { name: 'Create' }).click();
});

Then('I see a user-safe project creation unavailable message', async ({ page }) => {
    const form = formWithHeading(page, 'New Project');
    await expect(form.getByRole('alert')).toHaveText('Project creation is currently unavailable.');
    await expect(form).toHaveScreenshot('workspace-ux-new-project-safe-error.png');
});

Then('I do not see internal contract details', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText(
        /openapi\/backend-api\.json|POST \/projects|VITE_|stack trace|useCreateProjectMutation|ProjectCreationUnavailableError/i,
    );
});

Then('the Create action is visually primary', async ({ page }) => {
    const create = formWithHeading(page, 'New Project').getByRole('button', { name: 'Create' });
    await expect(create).toBeEnabled();
    await expectUsableButton(create);
    await expect(create).toHaveCSS('background-color', /rgb\((?!255, 255, 255)/);
});

Then('the Cancel action is visually secondary', async ({ page }) => {
    const cancel = formWithHeading(page, 'New Project').getByRole('button', { name: 'Cancel' });
    await expect(cancel).toBeEnabled();
    await expectUsableButton(cancel);
    await expect(cancel).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

Then('the form controls are aligned', async ({ page }) => {
    const form = formWithHeading(page, 'New Project');
    const input = await box(form.getByLabel('Project name'));
    const actions = await box(form.locator('.form__actions'));
    expect(actions.y).toBeGreaterThan(input.y + input.height);
    await expect(form).toHaveScreenshot('workspace-ux-new-project-form-aligned.png');
    await page.setViewportSize(narrow);
    await expect(form).toHaveScreenshot('workspace-ux-new-project-narrow.png');
});

Then('the requirement key lookup has an accessible label', async ({ page }) => {
    await expect(actionBar(page).getByLabel('Requirement key')).toBeVisible();
});

Then('the lookup input and Find key button are visibly separated', async ({ page }) => {
    const inputBox = await box(actionBar(page).getByLabel('Requirement key'));
    const buttonBox = await box(actionBar(page).getByRole('button', { name: 'Find key' }));
    expectPositiveGap(inputBox, buttonBox);
});

Then('the action bar controls are vertically aligned', async ({ page }) => {
    const bar = actionBar(page);
    const inputBox = await box(bar.getByLabel('Requirement key'));
    const findBox = await box(bar.getByRole('button', { name: 'Find key' }));
    const newReqBox = await box(bar.getByRole('button', { name: 'New requirement' }));
    expect(Math.abs(inputBox.y + inputBox.height / 2 - (findBox.y + findBox.height / 2))).toBeLessThanOrEqual(3);
    expect(Math.abs(findBox.y + findBox.height / 2 - (newReqBox.y + newReqBox.height / 2))).toBeLessThanOrEqual(3);
    await expect(bar).toHaveScreenshot('workspace-ux-actionbar-desktop.png');
    await page.setViewportSize({ width: 640, height: 768 });
    await expect(bar.getByLabel('Requirement key')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Find key' })).toBeVisible();
    await expect(bar).toHaveScreenshot('workspace-ux-actionbar-narrow.png');
});

Then('no action bar controls overlap', async ({ page }) => {
    const bar = actionBar(page);
    const controls = [
        bar.getByLabel('Requirement key'),
        bar.getByRole('button', { name: 'Find key' }),
        bar.getByRole('button', { name: 'New requirement' }),
    ];
    const boxes = await Promise.all(controls.map(box));
    for (let i = 0; i < boxes.length; i += 1)
        for (let j = i + 1; j < boxes.length; j += 1) expectNoOverlap(boxes[i], boxes[j]);
});

Given('a requirement is selected', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copy key' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Copy visible key');
    await page.evaluate(() => {
        let shouldFail = false;
        Object.defineProperty(window, '__failClipboard', {
            get: () => shouldFail,
            set: (value) => {
                shouldFail = Boolean(value);
            },
            configurable: true,
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: () => (shouldFail ? Promise.reject(new Error('denied')) : Promise.resolve()) },
        });
    });
});

When('I copy the requirement key', async ({ page }) => {
    await page.getByRole('button', { name: 'Copy key' }).click();
});

Then('I see feedback that the key was copied', async ({ page }) => {
    await expect(page.getByRole('status').filter({ hasText: 'Key copied.' })).toBeVisible();
});

Then('the feedback is announced accessibly', async ({ page }) => {
    await expect(page.locator('[role="status"][aria-live="polite"]').filter({ hasText: 'Key copied.' })).toBeVisible();
});

When('clipboard writing fails', async ({ page }) => {
    await page.evaluate(() => ((window as unknown as { __failClipboard: boolean }).__failClipboard = true));
});

When('I copy the requirement key again', async ({ page }) => {
    await page.getByRole('button', { name: 'Copy key' }).click();
});

Then('I see feedback that the key could not be copied', async ({ page }) => {
    await expect(page.getByRole('status').filter({ hasText: 'Could not copy the key.' })).toBeVisible();
});

When('I open the New Requirement form', async ({ page }) => {
    await page.getByRole('button', { name: 'New requirement' }).click();
    await expect(formWithHeading(page, 'New requirement')).toBeVisible();
});

Then('the form shows the active project', async ({ page }) => {
    const form = formWithHeading(page, 'New requirement');
    await expect(form).toContainText('Project: Requirements Platform');
    await expect(form.getByLabel(/Title/i)).toHaveCount(0);
    await expect(form.getByLabel(/^Type$/i)).toHaveCount(0);
});

Then('the Category field has an associated required label', async ({ page }) => {
    await expect(formWithHeading(page, 'New requirement').getByLabel('Category *')).toBeVisible();
});

When('I open the category selector', async ({ page }) => {
    await formWithHeading(page, 'New requirement').getByLabel('Category *').click();
    await expect(page.getByRole('option').first()).toBeVisible();
});

Then('category options are readable', async ({ page }) => {
    await expect(page.getByRole('option', { name: /UI — User Interface — FR/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /PERF — Performance — NFR/ })).toBeVisible();
    await expect(formWithHeading(page, 'New requirement')).toHaveScreenshot(
        'workspace-ux-new-requirement-selector-open.png',
    );
});

Then('the category options do not overlap Derived type', async ({ page }) => {
    await expectNoOverlap(
        await box(page.locator('.p-dropdown-panel')),
        await box(formWithHeading(page, 'New requirement').getByText(/Derived type:/)),
    );
});

Then('the category options do not overlap Description', async ({ page }) => {
    await expectNoOverlap(
        await box(page.locator('.p-dropdown-panel')),
        await box(formWithHeading(page, 'New requirement').getByLabel('Description *')),
    );
});

When('I select the UI category', async ({ page }) => {
    await page.getByRole('option', { name: /UI — User Interface — FR/ }).click();
});

Then('the derived type is shown outside the option list', async ({ page }) => {
    const form = formWithHeading(page, 'New requirement');
    await expect(form.getByText('Derived type: FR')).toBeVisible();
    await expect(page.locator('.p-dropdown-panel')).toBeHidden();
});

Then('all requirement fields remain aligned', async ({ page }) => {
    const form = formWithHeading(page, 'New requirement');
    const category = await box(form.getByLabel('Category *'));
    const derived = await box(form.getByText(/Derived type:/));
    const description = await box(form.getByLabel('Description *'));
    expect(derived.y).toBeGreaterThan(category.y + category.height);
    expect(description.y).toBeGreaterThan(derived.y + derived.height);
    expectNoOverlap(derived, description);
});

Then('Create and Cancel are usable actions', async ({ page }) => {
    const form = formWithHeading(page, 'New requirement');
    await expectUsableButton(form.getByRole('button', { name: 'Create requirement' }));
    await expectUsableButton(form.getByRole('button', { name: 'Cancel' }));
});

When('I open the New Category form', async ({ page }) => {
    await page.getByRole('button', { name: 'Categories' }).click();
    await page.getByRole('button', { name: 'New category' }).click();
    await expect(formWithHeading(page, 'New Category')).toBeVisible();
});

Then('the Category key field is labelled', async ({ page }) => {
    await expect(formWithHeading(page, 'New Category').getByLabel('Category key')).toBeVisible();
});

Then('the Category name field is labelled', async ({ page }) => {
    await expect(formWithHeading(page, 'New Category').getByLabel('Category name')).toBeVisible();
});

Then('the Category type radio group is labelled', async ({ page }) => {
    await expect(formWithHeading(page, 'New Category').getByRole('group', { name: 'Category type' })).toBeVisible();
});

Then('the Functional option is aligned with its radio control', async ({ page }) => {
    const form = formWithHeading(page, 'New Category');
    const radio = await box(form.getByRole('radio', { name: 'Functional (FR)' }));
    const label = await box(form.locator('label[for="category-type-fr"]'));
    expect(Math.abs(radio.y + radio.height / 2 - (label.y + label.height / 2))).toBeLessThanOrEqual(3);
    expectPositiveGap(radio, label);
});

Then('the Non-functional option is aligned with its radio control', async ({ page }) => {
    const form = formWithHeading(page, 'New Category');
    const radio = await box(form.getByRole('radio', { name: 'Non-functional (NFR)' }));
    const label = await box(form.locator('label[for="category-type-nfr"]'));
    expect(Math.abs(radio.y + radio.height / 2 - (label.y + label.height / 2))).toBeLessThanOrEqual(3);
    expectPositiveGap(radio, label);
    await expect(form).toHaveScreenshot('workspace-ux-new-category-form.png');
});

When('I select Non-functional', async ({ page }) => {
    await formWithHeading(page, 'New Category').locator('label[for="category-type-nfr"]').click();
});

Then('only Non-functional is selected', async ({ page }) => {
    const form = formWithHeading(page, 'New Category');
    await expect(form.getByRole('radio', { name: 'Non-functional (NFR)' })).toBeChecked();
    await expect(form.getByRole('radio', { name: 'Functional (FR)' })).not.toBeChecked();
});

Then('Create and Cancel are normal usable buttons', async ({ page }) => {
    const form = page.locator('form:visible');
    await expectUsableButton(form.getByRole('button', { name: 'Create' }));
    await expectUsableButton(form.getByRole('button', { name: 'Cancel' }));
});

Then('no form controls overlap', async ({ page }) => {
    const form = page.locator('form:visible');
    const controls = await Promise.all(
        [
            form.getByLabel('Category key'),
            form.getByLabel('Category name'),
            form.getByRole('group', { name: 'Category type' }),
            form.locator('.form__actions'),
        ].map(box),
    );
    for (let i = 0; i < controls.length; i += 1)
        for (let j = i + 1; j < controls.length; j += 1) expectNoOverlap(controls[i], controls[j]);
});

Given('I open requirement FR-UI-0028 in a dedicated tab', async ({ page }) => {
    await page.getByText('FR-UI-0028').dblclick();
    await page.getByRole('button', { name: 'Open in tab' }).click();
});

Then('the requirement tab is labelled FR-UI-0028', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'FR-UI-0028' })).toBeVisible();
    await expect(page.locator('.app-tabs')).toHaveScreenshot('workspace-ux-requirement-tab-close.png');
});

Then('the close button is visually separated from the key', async ({ page }) => {
    const label = await box(page.locator('.app-tabs__label', { hasText: 'FR-UI-0028' }));
    const close = await box(page.getByRole('button', { name: 'Close FR-UI-0028' }));
    expectPositiveGap(label, close);
    expectNoOverlap(label, close);
    expect(close.width).toBeGreaterThanOrEqual(32);
    expect(close.height).toBeGreaterThanOrEqual(32);
});

Then('the close button has an accessible name containing FR-UI-0028', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Close FR-UI-0028/ })).toBeVisible();
});

Then('the Workspace tab has no close button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Close Workspace/ })).toHaveCount(0);
});

When('I close the requirement tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Close FR-UI-0028' }).click();
});

Then('the Workspace tab is active', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Workspace' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'FR-UI-0028' })).toHaveCount(0);
});
