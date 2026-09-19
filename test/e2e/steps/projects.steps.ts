import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import {
    createTestProject,
    E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
    openAuthenticatedRoute,
    resetTestBackend,
    resolveTestProjectName,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

type DataTable = Readonly<{ hashes: () => readonly Record<string, string>[] }>;

function getProjectNames(dataTable: DataTable): string[] {
    return dataTable.hashes().map((row) => {
        const projectName = row.name;
        if (projectName.trim().length === 0) {
            throw new Error('The project data table must contain a non-empty "name" column.');
        }
        return projectName;
    });
}

async function setBackendProjects(projectNames: readonly string[]): Promise<void> {
    await resetTestBackend();
    for (const projectName of projectNames) {
        await createTestProject(projectName);
    }
}

function getProjectList(page: Page) {
    return page.getByRole('navigation', { name: 'Project list' });
}

function resolveProjectName(projectName: string): string {
    return resolveTestProjectName(projectName);
}

async function getVisibleProjectLabels(page: Page): Promise<string[]> {
    return getProjectList(page)
        .getByRole('button')
        .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label') ?? ''));
}

function getVisibleProjectDialog(page: Page) {
    return page.getByRole('dialog').filter({ has: page.getByLabel('Project name') });
}

function getAdministrativeProjectList(page: Page) {
    return page.getByRole('table', { name: 'All projects' });
}

async function waitUntilApplicationHasLoaded(page: Page): Promise<void> {
    await expect(page.getByText('SRM is loading ...')).not.toBeVisible({ timeout: APPLICATION_LOADING_TIMEOUT_MS });
    await expect(page.getByText('A network error has occured. Try again.')).not.toBeVisible();
}

async function fillProjectDialog(page: Page, projectName: string): Promise<void> {
    await getVisibleProjectDialog(page).getByLabel('Project name').fill(projectName);
}

async function submitProjectDialog(page: Page): Promise<void> {
    await getVisibleProjectDialog(page)
        .getByRole('button', { name: /^(Create|Rename)$/u })
        .click();
}

Given('the backend contains no projects', async () => {
    await resetTestBackend();
});

Given('the backend contains a project named {string}', async ({ page }, projectName: string) => {
    void page;
    await setBackendProjects([projectName]);
});

Given('the backend contains the projects', async ({ page }, dataTable: DataTable) => {
    void page;
    await setBackendProjects(getProjectNames(dataTable));
});

When('I open the application', async ({ page }) => {
    await openAuthenticatedRoute(page, '/', E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME);
    await waitUntilApplicationHasLoaded(page);
});

When('I open project {string} from the sidebar', async ({ page }, projectName: string) => {
    const resolvedProjectName = resolveProjectName(projectName);
    await getProjectList(page)
        .getByRole('button', { name: resolvedProjectName, exact: true })
        .click();
    await expect(page).toHaveURL(new RegExp(`/projects/[^/]+$`, 'u'));
});

When('I open Administrator project administration', async ({ page }) => {
    await openAuthenticatedRoute(page, '/admin/projects');
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
});

When('I create a project named {string}', async ({ page }, projectName: string) => {
    await page.getByRole('button', { name: 'New project' }).click();
    await fillProjectDialog(page, projectName);
    await submitProjectDialog(page);
    await expect(getVisibleProjectDialog(page)).toBeHidden();
});

When('I select administrative project {string}', async ({ page }, projectName: string) => {
    const resolvedProjectName = resolveProjectName(projectName);
    await getAdministrativeProjectList(page).getByRole('link', { name: resolvedProjectName, exact: true }).click();
    await expect(page.getByRole('heading', { name: resolvedProjectName })).toBeVisible();
});

When('I choose {string}', async ({ page }, action: string) => {
    await page.getByRole('button', { name: action, exact: true }).click();
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
    const expectedProjectNames = getProjectNames(dataTable).map(resolveProjectName);
    const visibleProjectNames = await getVisibleProjectLabels(page);
    const relevantProjectNames = visibleProjectNames.filter((projectName) =>
        expectedProjectNames.includes(projectName),
    );

    expect(relevantProjectNames).toEqual(expectedProjectNames);
});

Then('project administration should contain the project {string}', async ({ page }, projectName: string) => {
    const resolvedProjectName = resolveProjectName(projectName);
    const detailsHeading = page.getByRole('heading', { name: resolvedProjectName, exact: true });
    if ((await detailsHeading.count()) > 0) {
        await expect(detailsHeading).toBeVisible();
        return;
    }

    await expect(
        getAdministrativeProjectList(page).getByRole('link', { name: resolvedProjectName, exact: true }),
    ).toBeVisible();
});

Then('project administration should not contain the project {string}', async ({ page }, projectName: string) => {
    const resolvedProjectName = resolveProjectName(projectName);
    await expect(page.getByRole('heading', { name: resolvedProjectName, exact: true })).toHaveCount(0);
    await expect(
        getAdministrativeProjectList(page).getByRole('link', { name: resolvedProjectName, exact: true }),
    ).toHaveCount(0);
});

Then('the project dialog should show {string}', async ({ page }, message: string) => {
    await expect(getVisibleProjectDialog(page).getByText(message, { exact: true })).toBeVisible();
});
