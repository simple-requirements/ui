import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

import {
    createPersistentTestProject,
    createTestCategory,
    createTestRequirement,
    E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN,
    E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
    E2E_REVIEWER_LOGIN_USERNAME,
    E2E_REVIEWER_USER_ID,
    jsonRequestForToken,
    openAuthenticatedRoute,
    requestJson,
    resetTestBackend,
    setProjectMembership,
    type Requirement,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

type ReviewTaskContext = Readonly<{ projectId: string; requirement: Requirement }>;
let context: ReviewTaskContext | undefined;

function requireContext(): ReviewTaskContext {
    if (context === undefined) throw new Error('Review-task test context has not been created.');
    return context;
}

async function createReviewTaskProject(projectName: string): Promise<ReviewTaskContext> {
    await resetTestBackend();
    const project = await createPersistentTestProject(projectName);
    const category = await createTestCategory(project.id, { key: 'AUTH', type: 'FR', name: 'Authentication' });
    const requirement = await createTestRequirement(project.id, {
        categoryId: category.id,
        description: 'A second engineer must review this requirement.',
        priority: 'p1',
        owner: 'Requirements',
        rationale: null,
        source: 'Review task E2E',
    });
    return { projectId: project.id, requirement };
}

Given(
    'the backend contains a review-task project named {string} with a draft requirement',
    // eslint-disable-next-line no-empty-pattern -- Playwright BDD fixture signature
    async ({}, projectName: string) => {
        context = await createReviewTaskProject(projectName);
    },
);

Given('the Review Engineer has membership in the review-task project', async () => {
    await setProjectMembership(requireContext().projectId, E2E_REVIEWER_USER_ID);
});

Given(
    'the backend contains a review-task project named {string} with a pending task for the Review Engineer',
    // eslint-disable-next-line no-empty-pattern -- Playwright BDD fixture signature
    async ({}, projectName: string) => {
        context = await createReviewTaskProject(projectName);
        const { projectId, requirement } = requireContext();
        await setProjectMembership(projectId, E2E_REVIEWER_USER_ID);
        await requestJson(
            `/projects/${projectId}/requirements/${requirement.id}/review-tasks`,
            jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'POST', {
                assigneeUserId: E2E_REVIEWER_USER_ID,
            }),
            201,
        );
    },
);

When('I open the review-task requirement review as a Requirements Engineer', async ({ page }) => {
    const { projectId, requirement } = requireContext();
    await openAuthenticatedRoute(
        page,
        `/projects/${projectId}/requirements/${requirement.id}/review`,
        E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
    );
});

When('I assign the review task to {string}', async ({ page }, displayName: string) => {
    await page.getByRole('button', { name: 'Assign reviewer' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('.p-dropdown').click();
    await page.getByRole('option', { name: displayName }).click();
    await dialog.getByRole('button', { name: 'Assign', exact: true }).click();
});

Then('review assignments should show {string} as {string}', async ({ page }, displayName: string, status: string) => {
    const section = page.getByRole('region', { name: 'Review assignments' });
    await expect(section).toContainText(displayName);
    await expect(section).toContainText(status);
});

When('I open my review tasks as the Review Engineer', async ({ page }) => {
    await openAuthenticatedRoute(
        page,
        `/projects/${requireContext().projectId}/review-tasks`,
        E2E_REVIEWER_LOGIN_USERNAME,
    );
});

Then('my review tasks should contain the review-task requirement', async ({ page }) => {
    await expect(page.getByRole('table', { name: 'My review tasks' })).toContainText(
        requireContext().requirement.visibleKey,
    );
});

When('I mark the review-task requirement completed', async ({ page }) => {
    const row = page
        .getByRole('table', { name: 'My review tasks' })
        .getByRole('row')
        .filter({ hasText: requireContext().requirement.visibleKey });
    await row.getByRole('button', { name: 'Mark completed' }).click();
});

When('I show completed review tasks', async ({ page }) => {
    await page.getByLabel('Show completed').check();
});

Then('my review tasks should show the review-task requirement as {string}', async ({ page }, status: string) => {
    const row = page
        .getByRole('table', { name: 'My review tasks' })
        .getByRole('row')
        .filter({ hasText: requireContext().requirement.visibleKey });
    await expect(row).toContainText(status);
});
