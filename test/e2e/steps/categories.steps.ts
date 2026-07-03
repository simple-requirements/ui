import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { z } from 'zod';

const { Given, When, Then } = createBdd(test);

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

type DataTable = Readonly<{ hashes: () => readonly Record<string, string>[] }>;

const backendProjectSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
const backendProjectsSchema = z.array(backendProjectSchema);
const backendCategorySchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    name: z.string().min(1),
    key: z.string().min(1),
    type: z.enum(['FR', 'NFR']),
    requirementCount: z.number().optional().default(0),
});

type BackendProject = z.infer<typeof backendProjectSchema>;
type BackendCategory = z.infer<typeof backendCategorySchema>;
type CategoryTestContext = Readonly<{ project: BackendProject; categories: readonly BackendCategory[] }>;

let categoryTestContext: CategoryTestContext | undefined;

function createApiUrl(path: string): string {
    return new URL(path, API_BASE_URL).toString();
}

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

async function readJsonResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json') !== true) {
        return undefined;
    }

    return response.json() as Promise<unknown>;
}

async function listBackendProjects(): Promise<BackendProject[]> {
    const response = await fetch(createApiUrl('/projects'), { headers: { Accept: 'application/json' } });

    expect(response.ok, 'Expected the backend project list request to succeed.').toBe(true);

    const responseBody = await readJsonResponse(response);

    return backendProjectsSchema.parse(responseBody);
}

async function createBackendProject(projectName: string): Promise<BackendProject> {
    const response = await fetch(createApiUrl('/projects'), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName }),
    });

    expect(response.status, `Expected project "${projectName}" to be created.`).toBe(201);

    const responseBody = await readJsonResponse(response);

    return backendProjectSchema.parse(responseBody);
}

async function createBackendCategory(
    projectId: string,
    categoryData: Readonly<{ key: string; type: string; name: string }>,
): Promise<BackendCategory> {
    const response = await fetch(createApiUrl(`/projects/${projectId}/categories`), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    });

    expect(response.status, `Expected category "${categoryData.key}" to be created.`).toBe(201);

    const responseBody = await readJsonResponse(response);

    return backendCategorySchema.parse(responseBody);
}

async function deleteBackendProject(projectId: string): Promise<void> {
    const response = await fetch(createApiUrl(`/projects/${projectId}`), {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
    });

    expect(response.status, `Expected project "${projectId}" to be deleted.`).toBe(204);
}

async function clearBackendProjects(): Promise<void> {
    const projects = await listBackendProjects();

    await Promise.all(projects.map((project) => deleteBackendProject(project.id)));
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
    await page.goto(getCategoryListRoute());
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
        await clearBackendProjects();

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
    await page.goto(getCategoryDetailsRoute(categoryKey));
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
