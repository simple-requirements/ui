import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import {
    createTestCategory,
    createTestProject,
    openAuthenticatedRoute,
    resetTestBackend,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

type DataTable = Readonly<{ hashes: () => readonly Record<string, string>[] }>;

type BackendProject = Awaited<ReturnType<typeof createTestProject>>;
type BackendCategory = Awaited<ReturnType<typeof createTestCategory>>;
type CategoryTestContext = Readonly<{ project: BackendProject; categories: readonly BackendCategory[] }>;

let categoryTestContext: CategoryTestContext | undefined;

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function requireCategoryTestContext(): CategoryTestContext {
    if (categoryTestContext === undefined) {
        throw new Error('The category test context has not been created yet.');
    }

    return categoryTestContext;
}

function requireCategoryByKey(categoryKey: string): BackendCategory {
    const { categories } = requireCategoryTestContext();
    const category = categories.find((currentCategory) => currentCategory.key === categoryKey);

    if (category === undefined) {
        throw new Error(`Category "${categoryKey}" has not been created in the category test context.`);
    }

    return category;
}

function getCategoryRows(dataTable: DataTable): readonly Record<string, string>[] {
    return dataTable.hashes().map((row) => {
        const key = row.key;
        const type = row.type;
        const name = row.name;

        if (key.trim().length === 0 || type.trim().length === 0 || name.trim().length === 0) {
            throw new Error('The category data table must contain non-empty "key", "type", and "name" columns.');
        }

        return row;
    });
}


async function createBackendProject(projectName: string): Promise<BackendProject> {
    return createTestProject(projectName);
}

async function createBackendCategory(
    projectId: string,
    categoryData: Readonly<{ key: string; type: string; name: string }>,
): Promise<BackendCategory> {
    return createTestCategory(projectId, categoryData);
}

async function openAuthenticatedApplicationRoute(page: Page, route: string): Promise<void> {
    await openAuthenticatedRoute(page, route);
}

async function waitUntilApplicationHasLoaded(page: Page): Promise<void> {
    await expect(page.getByText('SRM is loading ...')).not.toBeVisible({ timeout: APPLICATION_LOADING_TIMEOUT_MS });
    await expect(page.getByText('A network error has occured. Try again.')).not.toBeVisible();
}

function getCategoryListRoute(): string {
    const { project } = requireCategoryTestContext();

    return `/projects/${project.id}/categories`;
}

function getCategoryDetailsRoute(categoryKey: string): string {
    const { project } = requireCategoryTestContext();
    const category = requireCategoryByKey(categoryKey);

    return `/projects/${project.id}/categories/${category.id}`;
}

function getRequirementCreateRoute(categoryKey: string): string {
    const { project } = requireCategoryTestContext();
    const category = requireCategoryByKey(categoryKey);

    return `/projects/${project.id}/requirements/new?categoryId=${encodeURIComponent(category.id)}`;
}

function getCategoryTable(page: Page) {
    return page.locator('.project-categories-list-page__data-table');
}

function getCategoryTableRow(page: Page, categoryKey: string) {
    return getCategoryTable(page).locator('.p-datatable-tbody > tr').filter({ hasText: categoryKey });
}

function getCategoryDetailsPanel(page: Page) {
    return page.locator('.category-details-panel');
}

async function openCategoryList(page: Page): Promise<void> {
    await openAuthenticatedApplicationRoute(page, getCategoryListRoute());
    await waitUntilApplicationHasLoaded(page);
    await expect(getCategoryTable(page)).toBeVisible();
}

async function openCategoryDetailsTab(page: Page, categoryKey: string): Promise<void> {
    await openCategoryList(page);
    await getCategoryTableRow(page, categoryKey).dblclick();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getCategoryDetailsRoute(categoryKey))}$`, 'u'));
}

Given(
    'the backend contains a category test project named {string} with categories',
    // eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
    async ({}, projectName: string, dataTable: DataTable) => {
        await resetTestBackend();

        const project = await createBackendProject(projectName);
        const categories: BackendCategory[] = [];

        for (const categoryRow of getCategoryRows(dataTable)) {
            categories.push(
                await createBackendCategory(project.id, {
                    key: categoryRow.key,
                    type: categoryRow.type,
                    name: categoryRow.name,
                }),
            );
        }

        categoryTestContext = { project, categories };
    },
);

When('I open the category list for the category test project', async ({ page }) => {
    await openCategoryList(page);
});

When('I select category {string}', async ({ page }, categoryKey: string) => {
    await getCategoryTableRow(page, categoryKey).click();
});

When('I double-click category {string}', async ({ page }, categoryKey: string) => {
    await getCategoryTableRow(page, categoryKey).dblclick();
});

Given('I opened the category details tab for category {string}', async ({ page }, categoryKey: string) => {
    await openCategoryDetailsTab(page, categoryKey);
});

When('I close the {string} tab', async ({ page }, tabLabel: string) => {
    await page.getByRole('button', { name: `Close ${tabLabel} tab` }).click();
});

When('I open the category details URL directly for category {string}', async ({ page }, categoryKey: string) => {
    await openAuthenticatedApplicationRoute(page, getCategoryDetailsRoute(categoryKey));
    await waitUntilApplicationHasLoaded(page);
});

Then('the categories table should show the categories', async ({ page }, dataTable: DataTable) => {
    for (const categoryRow of getCategoryRows(dataTable)) {
        const row = getCategoryTableRow(page, categoryRow.key);

        await expect(row).toContainText(categoryRow.type);
        await expect(row).toContainText(categoryRow.name);
        await expect(row).toContainText(categoryRow.requirements);
    }
});

Then('the category details panel should show category {string}', async ({ page }, categoryKey: string) => {
    const category = requireCategoryByKey(categoryKey);
    const detailsPanel = getCategoryDetailsPanel(page);

    await expect(detailsPanel).toContainText(category.key);
    await expect(detailsPanel).toContainText(category.name);
    await expect(detailsPanel).toContainText(category.type);
});

Then('the URL should point to the details route for category {string}', async ({ page }, categoryKey: string) => {
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getCategoryDetailsRoute(categoryKey))}$`, 'u'));
});

Then('the tab bar should contain {string}', async ({ page }, tabLabel: string) => {
    await expect(page.getByRole('group', { name: `${tabLabel} tab` })).toBeVisible();
});

Then('the full category details page should show category {string}', async ({ page }, categoryKey: string) => {
    await expect(getCategoryTable(page)).toHaveCount(0);
    await expect(getCategoryDetailsPanel(page).getByRole('heading', { name: `Category ${categoryKey}` })).toBeVisible();
    await expect(getCategoryDetailsPanel(page)).toContainText(requireCategoryByKey(categoryKey).name);
});

Then('the URL should point to the category list route', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getCategoryListRoute())}$`, 'u'));
});

Then('the categories table should be visible again', async ({ page }) => {
    await expect(getCategoryTable(page)).toBeVisible();
});

When('I copy category key {string}', async ({ page }, categoryKey: string) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await getCategoryTable(page)
        .getByRole('link', { name: `Copy category key ${categoryKey}` })
        .click();
});

When('I open the context menu for category {string}', async ({ page }, categoryKey: string) => {
    await getCategoryTableRow(page, categoryKey).click({ button: 'right' });
});

When('I choose Add requirement for category {string}', async ({ page }, categoryKey: string) => {
    await getCategoryTableRow(page, categoryKey).click({ button: 'right' });
    await page.getByRole('menuitem', { name: /add requirement/i }).click();
});

Then('the category key copied toast should be visible for category {string}', async ({ page }, categoryKey: string) => {
    await expect(page.getByText('Category key copied')).toBeVisible();
    await expect(page.getByText(`${categoryKey} has been copied to the clipboard.`)).toBeVisible();
    await expect.poll(async () => page.evaluate(() => navigator.clipboard.readText())).toBe(categoryKey);
});

Then('the category context menu should show the category actions', async ({ page }) => {
    await expect(page.getByRole('menuitem', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /add requirement/i })).toBeVisible();
});

Then('the requirement creation form should be visible for category {string}', async ({ page }, categoryKey: string) => {
    const category = requireCategoryByKey(categoryKey);
    const formRegion = page.getByRole('region', { name: /create requirement/i });

    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getRequirementCreateRoute(categoryKey))}$`, 'u'));
    await expect(formRegion.getByRole('heading', { name: /create requirement/i })).toBeVisible();
    await expect(page.getByLabel('Category')).toHaveValue(category.id);
    await expect(page.getByLabel('Category')).toContainText(`${category.key} — ${category.name} (${category.type})`);
    await expect(page.getByLabel('Priority')).toHaveValue('p1');
    await expect(formRegion.getByRole('button', { name: 'Create' })).toBeVisible();
});
