import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import {
    createTestProject,
    deleteTestProject,
    listTestProjects,
    openAuthenticatedRoute,
    resetTestBackend,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

type DataTable = Readonly<{ hashes: () => readonly Record<string, string>[] }>;

type BackendProject = Awaited<ReturnType<typeof createTestProject>>;

function getProjectNames(dataTable: DataTable): string[] {
    return dataTable.hashes().map((row) => {
        const projectName = row.name;

        if (projectName.trim().length === 0) {
            throw new Error('The project data table must contain a non-empty "name" column.');
        }

        return projectName;
    });
}

async function listBackendProjects(): Promise<BackendProject[]> {
    return listTestProjects();
}

async function createBackendProject(projectName: string): Promise<void> {
    await createTestProject(projectName);
}

async function deleteBackendProject(projectId: string): Promise<void> {
    await deleteTestProject(projectId);
}

async function clearBackendProjects(): Promise<void> {
    const projects = await listBackendProjects();

    for (const project of projects) {
        await deleteBackendProject(project.id);
    }
}

async function setBackendProjects(projectNames: readonly string[]): Promise<void> {
    await clearBackendProjects();

    for (const projectName of projectNames) {
        await createBackendProject(projectName);
    }
}

async function prepareAuthenticatedApplication(page: Page): Promise<void> {
    await openAuthenticatedRoute(page, '/');
}

function getProjectList(page: Page) {
    return page.getByRole('navigation', { name: 'Project list' });
}

function getProjectLabel(page: Page, projectName: string) {
    return getProjectList(page).getByText(projectName, { exact: true });
}

function getVisibleProjectLabels(page: Page) {
    return getProjectList(page).locator('.expandable-navigation-item__label');
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
    await resetTestBackend();
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
    await prepareAuthenticatedApplication(page);
    await waitUntilApplicationHasLoaded(page);
});

When('I create a project named {string}', async ({ page }, projectName: string) => {
    await page.getByRole('button', { name: 'New project' }).click();
    await fillProjectDialog(page, projectName);
    await submitProjectDialog(page);

    await expect(getVisibleProjectDialog(page)).toBeHidden();
});

When('I open project {string} from the sidebar', async ({ page }, projectName: string) => {
    await getProjectButton(page, projectName).click();
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
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
