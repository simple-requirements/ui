import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { z } from 'zod';

const { Given, When, Then } = createBdd(test);

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

const OPTIONAL_TABLE_VALUE = '—';

type DataTable = Readonly<{ hashes: () => readonly Record<string, string>[] }>;

const backendProjectSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
const backendProjectsSchema = z.array(backendProjectSchema);
const backendCategorySchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    name: z.string().min(1),
    key: z.string().min(1),
    type: z.enum(['FR', 'NFR']),
    requirementCount: z.number().optional(),
});
const backendRequirementSchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    categoryId: z.string().min(1),
    visibleKey: z.string().min(1),
    status: z.enum(['draft', 'approved', 'implemented', 'obsolete', 'rejected']),
    description: z.string().nullable(),
    priority: z.enum(['p1', 'p2', 'p3']).nullable(),
    owner: z.string().nullable(),
    rationale: z.string().nullable(),
    source: z.string().nullable(),
    reviewer: z.string().nullable(),
});

type BackendProject = z.infer<typeof backendProjectSchema>;
type BackendCategory = z.infer<typeof backendCategorySchema>;
type BackendRequirement = z.infer<typeof backendRequirementSchema>;
type RequirementTestContext = Readonly<{
    project: BackendProject;
    categories: readonly BackendCategory[];
    requirements: readonly BackendRequirement[];
}>;

let requirementTestContext: RequirementTestContext | undefined;

function createApiUrl(path: string): string {
    return new URL(path, API_BASE_URL).toString();
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function normalizeOptionalTableValue(value: string | undefined): string | null {
    if (value === undefined || value.trim().length === 0 || value === OPTIONAL_TABLE_VALUE) {
        return null;
    }

    return value;
}

function formatStatus(status: BackendRequirement['status']): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function requireRequirementTestContext(): RequirementTestContext {
    if (requirementTestContext === undefined) {
        throw new Error('The requirement test context has not been created yet.');
    }

    return requirementTestContext;
}

function requireRequirementByKey(requirementKey: string): BackendRequirement {
    const { requirements } = requireRequirementTestContext();
    const requirement = requirements.find((currentRequirement) => currentRequirement.visibleKey === requirementKey);

    if (requirement === undefined) {
        throw new Error(`Requirement "${requirementKey}" has not been created in the requirement test context.`);
    }

    return requirement;
}

function getRequirementRows(dataTable: DataTable): readonly Record<string, string>[] {
    return dataTable.hashes().map((row) => {
        const categoryKey = row.categoryKey;
        const categoryType = row.categoryType;
        const categoryName = row.categoryName;
        const description = row.description;

        if (
            categoryKey.trim().length === 0
            || categoryType.trim().length === 0
            || categoryName.trim().length === 0
            || description.trim().length === 0
        ) {
            throw new Error(
                'The requirement data table must contain non-empty "categoryKey", "categoryType", "categoryName", and "description" columns.',
            );
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

async function createBackendRequirement(
    projectId: string,
    requirementData: Readonly<{
        categoryId: string;
        description: string;
        priority: string | null;
        owner: string | null;
        rationale: string | null;
        source: string | null;
    }>,
): Promise<BackendRequirement> {
    const response = await fetch(createApiUrl(`/projects/${projectId}/requirements`), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(requirementData),
    });

    expect(response.status, `Expected requirement "${requirementData.description}" to be created.`).toBe(201);

    const responseBody = await readJsonResponse(response);

    return backendRequirementSchema.parse(responseBody);
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

function getRequirementListRoute(): string {
    const { project } = requireRequirementTestContext();

    return `/projects/${project.id}/requirements`;
}

function getRequirementDetailsRoute(requirementKey: string): string {
    const { project } = requireRequirementTestContext();
    const requirement = requireRequirementByKey(requirementKey);

    return `/projects/${project.id}/requirements/${requirement.id}`;
}

function getRequirementTable(page: Page) {
    return page.locator('.project-requirements-list-page__data-table');
}

function getRequirementTableRow(page: Page, requirementKey: string) {
    return getRequirementTable(page).locator('.p-datatable-tbody > tr').filter({ hasText: requirementKey });
}

function getRequirementSelectionCell(page: Page, requirementKey: string) {
    return getRequirementTableRow(page, requirementKey).locator('td').nth(1);
}

function getRequirementDetailsPanel(page: Page) {
    return page.locator('.requirement-details-panel');
}

function getProjectList(page: Page) {
    return page.getByRole('navigation', { name: 'Project list' });
}

function getProjectButton(page: Page, projectName: string) {
    return getProjectList(page).getByRole('button').filter({ hasText: projectName });
}

async function openRequirementList(page: Page): Promise<void> {
    await page.goto(getRequirementListRoute());
    await waitUntilApplicationHasLoaded(page);
    await expect(getRequirementTable(page)).toBeVisible();
}

async function openRequirementDetailsTab(page: Page, requirementKey: string): Promise<void> {
    await openRequirementList(page);
    await getRequirementTableRow(page, requirementKey).dblclick();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getRequirementDetailsRoute(requirementKey))}$`, 'u'));
}

Given(
    'the backend contains a requirement test project named {string} with requirements',
    // eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
    async ({}, projectName: string, dataTable: DataTable) => {
        await clearBackendProjects();

        const project = await createBackendProject(projectName);
        const categoriesByKey = new Map<string, BackendCategory>();
        const requirements: BackendRequirement[] = [];

        for (const requirementRow of getRequirementRows(dataTable)) {
            let category = categoriesByKey.get(requirementRow.categoryKey);

            if (category === undefined) {
                category = await createBackendCategory(project.id, {
                    key: requirementRow.categoryKey,
                    type: requirementRow.categoryType,
                    name: requirementRow.categoryName,
                });
                categoriesByKey.set(category.key, category);
            }

            requirements.push(
                await createBackendRequirement(project.id, {
                    categoryId: category.id,
                    description: requirementRow.description,
                    priority: normalizeOptionalTableValue(requirementRow.priority),
                    owner: normalizeOptionalTableValue(requirementRow.owner),
                    rationale: normalizeOptionalTableValue(requirementRow.rationale),
                    source: normalizeOptionalTableValue(requirementRow.source),
                }),
            );
        }

        requirementTestContext = { project, categories: [...categoriesByKey.values()], requirements };
    },
);

When('I open the requirements list for the requirement test project', async ({ page }) => {
    await openRequirementList(page);
});

When('I select requirement {string}', async ({ page }, requirementKey: string) => {
    await getRequirementSelectionCell(page, requirementKey).click();
});

When('I double-click requirement {string}', async ({ page }, requirementKey: string) => {
    await getRequirementSelectionCell(page, requirementKey).dblclick();
});

When('I copy requirement key {string}', async ({ page }, requirementKey: string) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await getRequirementTable(page)
        .getByRole('button', { name: `Copy requirement key ${requirementKey}` })
        .click();
});

Given('I opened the requirement details tab for requirement {string}', async ({ page }, requirementKey: string) => {
    await openRequirementDetailsTab(page, requirementKey);
});

When(
    'I open the requirement details URL directly for requirement {string}',
    async ({ page }, requirementKey: string) => {
        await page.goto(getRequirementDetailsRoute(requirementKey));
        await waitUntilApplicationHasLoaded(page);
    },
);

Then('the requirements table should show the requirements', async ({ page }, dataTable: DataTable) => {
    for (const requirementRow of dataTable.hashes()) {
        const row = getRequirementTableRow(page, requirementRow.key);

        await expect(row).toContainText(requirementRow.status);
        await expect(row).toContainText(requirementRow.description);
        await expect(row).toContainText(requirementRow.priority);
        await expect(row).toContainText(requirementRow.owner);
    }
});

Then(
    'the sidebar should show requirement count {int} for project {string}',
    async ({ page }, requirementCount: number, projectName: string) => {
        await expect(getProjectButton(page, projectName)).toContainText(requirementCount.toString());
    },
);

Then('the requirement details panel should show requirement {string}', async ({ page }, requirementKey: string) => {
    const requirement = requireRequirementByKey(requirementKey);
    const detailsPanel = getRequirementDetailsPanel(page);

    await expect(detailsPanel).toContainText(requirement.visibleKey);
    await expect(detailsPanel).toContainText(formatStatus(requirement.status));
    await expect(detailsPanel).toContainText(requirement.description ?? OPTIONAL_TABLE_VALUE);
    await expect(detailsPanel).toContainText(requirement.priority ?? OPTIONAL_TABLE_VALUE);
    await expect(detailsPanel).toContainText(requirement.owner ?? OPTIONAL_TABLE_VALUE);
    await expect(detailsPanel).toContainText(requirement.source ?? OPTIONAL_TABLE_VALUE);
});

Then(
    'the requirement key copied toast should be visible for requirement {string}',
    async ({ page }, requirementKey: string) => {
        await expect(page.getByText('Requirement key copied')).toBeVisible();
        await expect(page.getByText(`${requirementKey} has been copied to the clipboard.`)).toBeVisible();
        await expect.poll(async () => page.evaluate(() => navigator.clipboard.readText())).toBe(requirementKey);
    },
);

Then('the URL should point to the details route for requirement {string}', async ({ page }, requirementKey: string) => {
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getRequirementDetailsRoute(requirementKey))}$`, 'u'));
});

Then('the full requirement details page should show requirement {string}', async ({ page }, requirementKey: string) => {
    const requirement = requireRequirementByKey(requirementKey);

    await expect(getRequirementTable(page)).toHaveCount(0);
    await expect(getRequirementDetailsPanel(page).getByRole('heading', { name: requirement.visibleKey })).toBeVisible();
    await expect(getRequirementDetailsPanel(page)).toContainText(requirement.description ?? OPTIONAL_TABLE_VALUE);
});

Then('the URL should point to the requirements list route', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(getRequirementListRoute())}$`, 'u'));
});

Then('the requirements table should be visible again', async ({ page }) => {
    await expect(getRequirementTable(page)).toBeVisible();
});
