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

type BackendProject = z.infer<typeof backendProjectSchema>;

function createApiUrl(path: string): string {
    return new URL(path, API_BASE_URL).toString();
}

function getProjectNames(dataTable: DataTable): string[] {
    return dataTable.hashes().map((row) => {
        const projectName = row.name;

        if (projectName.trim().length === 0) {
            throw new Error('The project data table must contain a non-empty "name" column.');
        }

        return projectName;
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

async function createBackendProject(projectName: string): Promise<void> {
    const response = await fetch(createApiUrl('/projects'), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName }),
    });

    expect(response.status, `Expected project "${projectName}" to be created.`).toBe(201);
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

async function setBackendProjects(projectNames: readonly string[]): Promise<void> {
    await clearBackendProjects();

    for (const projectName of projectNames) {
        await createBackendProject(projectName);
    }
}

function getProjectList(page: Page) {
    return page.getByRole('navigation', { name: 'Project list' });
}

function getProjectLabel(page: Page, projectName: string) {
    return getProjectList(page).getByText(projectName, { exact: true });
}

function getVisibleProjectLabels(page: Page) {
    return getProjectList(page).locator('.sidebar-entry__label');
}

function getProjectButton(page: Page, projectName: string) {
    return getProjectList(page).getByRole('button').filter({ hasText: projectName });
}

function getVisibleProjectDialog(page: Page) {
    return page.getByRole('dialog').filter({ has: page.getByLabel('Project name') });
}

async function waitUntilApplicationHasLoaded(page: Page): Promise<void> {
    await expect(page.getByText('SRM is loading ...')).not.toBeVisible({ timeout: APPLICATION_LOADING_TIMEOUT_MS });
    await expect(page.getByText('A network error has occured. Try again.')).not.toBeVisible();
}

async function fillProjectDialog(page: Page, projectName: string): Promise<void> {
    const projectDialog = getVisibleProjectDialog(page);

    await projectDialog.getByLabel('Project name').fill(projectName);
}

async function submitProjectDialog(page: Page): Promise<void> {
    const projectDialog = getVisibleProjectDialog(page);

    await projectDialog.getByRole('button', { name: /^(Create|Rename)$/ }).click();
}

Given('the backend contains no projects', async () => {
    await clearBackendProjects();
});

// eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
Given('the backend contains a project named {string}', async ({}, projectName: string) => {
    await setBackendProjects([projectName]);
});

// eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
Given('the backend contains the projects', async ({}, dataTable: DataTable) => {
    await setBackendProjects(getProjectNames(dataTable));
});

When('I open the application', async ({ page }) => {
    await page.goto('/');
    await waitUntilApplicationHasLoaded(page);
});

When('I create a project named {string}', async ({ page }, projectName: string) => {
    await page.getByRole('button', { name: 'New project' }).click();
    await fillProjectDialog(page, projectName);
    await submitProjectDialog(page);

    await expect(getVisibleProjectDialog(page)).toBeHidden();
});

When('I open the context menu for project {string}', async ({ page }, projectName: string) => {
    await getProjectButton(page, projectName).click({ button: 'right' });
});

When('I choose {string}', async ({ page }, menuEntry: string) => {
    await page.getByText(menuEntry, { exact: true }).click();
});

When('I rename the project to {string}', async ({ page }, projectName: string) => {
    await fillProjectDialog(page, projectName);
    await submitProjectDialog(page);

    await expect(getVisibleProjectDialog(page)).toBeHidden();
});

When('I submit the project dialog with an empty name', async ({ page }) => {
    await fillProjectDialog(page, '   ');
    await submitProjectDialog(page);
});

Then('the sidebar should show the projects in this order', async ({ page }, dataTable: DataTable) => {
    await expect(getVisibleProjectLabels(page)).toHaveText(getProjectNames(dataTable));
});

Then('the sidebar should contain the project {string}', async ({ page }, projectName: string) => {
    await expect(getProjectLabel(page, projectName)).toBeVisible();
});

Then('the sidebar should not contain the project {string}', async ({ page }, projectName: string) => {
    await expect(getProjectLabel(page, projectName)).toHaveCount(0);
});

Then('the project dialog should show {string}', async ({ page }, message: string) => {
    await expect(getVisibleProjectDialog(page).getByText(message, { exact: true })).toBeVisible();
});
