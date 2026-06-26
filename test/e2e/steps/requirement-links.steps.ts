import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { clearBrowserStateBeforeNavigation } from '../lib/clearBrowserStateBeforeNavigation';
import { waitForWorkspaceReady } from '../lib/waitForWorkspaceReady';
import { backendApiBaseUrl } from '../support/projectCleanup';

type ProjectResponse = Readonly<{ id: string; name: string }>;
type CategoryResponse = Readonly<{ id: string; key: string; type: 'FR' | 'NFR' }>;
type RequirementResponse = Readonly<{ id: string; visibleKey: string }>;
type LinkScenarioState = Readonly<{
    project: ProjectResponse;
    source: RequirementResponse;
    existingTarget: RequirementResponse;
    unusedTarget: RequirementResponse;
    incomingSource: RequirementResponse;
}>;

const { Given, Then, When } = createBdd(test);
const stateByPage = new WeakMap<Page, LinkScenarioState>();
const apiBaseUrl = () => backendApiBaseUrl();

const jsonRequest = async <T>(
    request: APIRequestContext,
    method: 'get' | 'post' | 'patch',
    path: string,
    data?: unknown,
) => {
    const response = await request[method](`${apiBaseUrl()}${path}`, data === undefined ? undefined : { data });
    if (!response.ok())
        throw new Error(`${method.toUpperCase()} ${path} failed: ${response.status()} ${await response.text()}`);
    return (await response.json()) as T;
};

const createRequirement = (request: APIRequestContext, projectId: string, categoryId: string, description: string) =>
    jsonRequest<RequirementResponse>(request, 'post', '/requirements', {
        projectId,
        categoryId,
        description,
        priority: 'p2',
        owner: 'E2E',
        rationale: 'Requirement-link E2E setup.',
        source: 'Playwright',
    });

const requireState = (page: Page) => {
    const state = stateByPage.get(page);
    if (!state) throw new Error('Requirement-link E2E state was not prepared.');
    return state;
};

const selectRequirement = async (page: Page, visibleKey: string) => {
    const row = page.getByRole('row').filter({ hasText: visibleKey });

    await expect(row).toBeVisible();
    await row.click();
    await expect(page.getByRole('heading', { name: visibleKey })).toBeVisible();
};

Given('a temporary project with linked requirements is open', async ({ page, request }) => {
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const projectName = `E2E Links ${suffix}`;
    const project = await jsonRequest<ProjectResponse>(request, 'post', '/projects', { name: projectName });
    const categories = await jsonRequest<CategoryResponse[]>(request, 'get', '/categories');
    const functionalCategory =
        categories.find((category) => category.key === 'UI') ?? categories.find((category) => category.type === 'FR');
    const nonFunctionalCategory =
        categories.find((category) => category.key === 'PERF')
        ?? categories.find((category) => category.type === 'NFR')
        ?? functionalCategory;

    if (!functionalCategory || !nonFunctionalCategory) {
        throw new Error('Requirement-link E2E setup requires at least one FR and one NFR category.');
    }

    const source = await createRequirement(request, project.id, functionalCategory.id, `Temporary source ${suffix}`);
    const existingTarget = await createRequirement(
        request,
        project.id,
        nonFunctionalCategory.id,
        `Temporary existing target ${suffix}`,
    );
    const unusedTarget = await createRequirement(
        request,
        project.id,
        functionalCategory.id,
        `Temporary unused target ${suffix}`,
    );
    const incomingSource = await createRequirement(
        request,
        project.id,
        functionalCategory.id,
        `Temporary incoming source ${suffix}`,
    );

    await jsonRequest(request, 'patch', `/requirements/${source.id}`, {
        description: `Temporary source ${suffix} before requirement links`,
        priority: 'p2',
        owner: 'E2E',
        rationale: 'Requirement-link E2E baseline before link creation.',
        source: 'Playwright',
    });
    await jsonRequest(request, 'post', `/requirements/${source.id}/links`, {
        targetVisibleKey: existingTarget.visibleKey,
    });
    await jsonRequest(request, 'post', `/requirements/${incomingSource.id}/links`, {
        targetVisibleKey: source.visibleKey,
    });
    await jsonRequest(request, 'patch', `/requirements/${source.id}`, {
        description: `Temporary source ${suffix} with revision history`,
        priority: 'p2',
        owner: 'E2E',
        rationale: 'Requirement-link E2E setup after link creation.',
        source: 'Playwright',
    });

    stateByPage.set(page, { project, source, existingTarget, unusedTarget, incomingSource });

    await clearBrowserStateBeforeNavigation(page);
    await page.goto('/');
    await waitForWorkspaceReady(page);
    await page.getByRole('button', { name: project.name }).click();
    await selectRequirement(page, source.visibleKey);
});

When('I create a requirement link to the unused temporary target', async ({ page }) => {
    const state = requireState(page);

    await page.getByLabel('Target visible key').fill(state.unusedTarget.visibleKey);
    await page.getByRole('button', { name: 'Create link' }).click();
});

When('I try to create a requirement link to {string}', async ({ page }, targetVisibleKey: string) => {
    await page.getByLabel('Target visible key').fill(targetVisibleKey);
    await page.getByRole('button', { name: 'Create link' }).click();
});

When('I correct the existing outgoing link to the unused temporary target', async ({ page }) => {
    const state = requireState(page);
    const form = page.getByRole('form', { name: `Correct link target ${state.existingTarget.visibleKey}` });

    await form.getByLabel(`New target for ${state.existingTarget.visibleKey}`).fill(state.unusedTarget.visibleKey);
    await form.getByRole('button', { name: 'Correct' }).click();
});

When('I remove the existing outgoing requirement link', async ({ page }) => {
    const state = requireState(page);
    const form = page.getByRole('form', { name: `Correct link target ${state.existingTarget.visibleKey}` });

    await form.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('dialog', { name: 'Remove requirement link' }).getByRole('button', { name: 'Remove' }).click();
});

When('I open the existing outgoing linked requirement', async ({ page }) => {
    const outgoingLinks = page.getByRole('region', { name: 'Outgoing links' });

    await outgoingLinks.getByRole('button', { name: 'Open' }).first().click();
});

When('I open revision comparison {string}', async ({ page }, comparison: string) => {
    const state = requireState(page);

    await page.goto(`/requirements/${state.source.id}/compare/${comparison}`);
    await expect(page.getByRole('region', { name: `Revision history for ${state.source.visibleKey}` })).toBeVisible();
});

Then('the requirement links section is visible', async ({ page }) => {
    const state = requireState(page);

    await expect(page.getByRole('region', { name: `Requirement links for ${state.source.visibleKey}` })).toBeVisible();
});

Then('the outgoing links section is visible', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Outgoing links' })).toBeVisible();
});

Then('the incoming links section is visible', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Incoming links' })).toBeVisible();
});

Then('the link history section is visible', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Requirement link history' })).toBeVisible();
});

Then('the outgoing links include the existing temporary target', async ({ page }) => {
    const state = requireState(page);

    await expect(page.getByRole('region', { name: 'Outgoing links' })).toContainText(state.existingTarget.visibleKey);
});

Then('the outgoing links include the unused temporary target', async ({ page }) => {
    const state = requireState(page);

    await expect(page.getByRole('region', { name: 'Outgoing links' })).toContainText(state.unusedTarget.visibleKey);
});

Then('the outgoing links no longer include the existing temporary target', async ({ page }) => {
    const state = requireState(page);

    await expect(page.getByRole('region', { name: 'Outgoing links' })).not.toContainText(
        state.existingTarget.visibleKey,
    );
});

Then('the incoming links include the existing temporary source', async ({ page }) => {
    const state = requireState(page);

    await expect(page.getByRole('region', { name: 'Incoming links' })).toContainText(state.incomingSource.visibleKey);
});

Then('the link history contains a {string} event', async ({ page }, eventType: string) => {
    await expect(page.getByRole('region', { name: 'Requirement link history' })).toContainText(eventType);
});

Then('I see {string} link feedback', async ({ page }, feedback: string) => {
    await expect(page.getByRole('status').filter({ hasText: feedback })).toBeVisible();
});

Then('the linked target requirement is selected', async ({ page }) => {
    const state = requireState(page);

    await expect(page.getByRole('heading', { name: state.existingTarget.visibleKey })).toBeVisible();
});

Then('the comparison shows requirement link changes', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Requirement link changes' })).toBeVisible();
});

Then('the comparison shows added outgoing requirement links', async ({ page }) => {
    const state = requireState(page);
    const changes = page.getByRole('region', { name: 'Requirement link changes' });

    await expect(changes.getByText('Added outgoing links')).toBeVisible();
    await expect(changes).toContainText(state.existingTarget.visibleKey);
});
