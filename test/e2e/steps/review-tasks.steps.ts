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

When('I open the review-task project requirements as a Requirements Engineer', async ({ page }) => {
    const { projectId } = requireContext();
    await openAuthenticatedRoute(page, `/projects/${projectId}/requirements`, E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME);
});

Then('the review-task requirement should allow reviewer assignment', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Assign reviewer' })).toBeVisible();
});

When('I assign the review task to {string}', async ({ page }, displayName: string) => {
    await page.getByRole('button', { name: 'Assign reviewer' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('.p-dropdown').click();
    await page.getByRole('option', { name: displayName }).click();
    await dialog.getByRole('button', { name: 'Assign', exact: true }).click();
    await expect(dialog).not.toBeVisible();
});

Then('reviewer assignment should no longer be available for the review-task requirement', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Assign reviewer' })).not.toBeVisible();
});

When('I open the review-task project requirements as the Review Engineer', async ({ page }) => {
    const { projectId } = requireContext();
    const reviewTasksResponse = page.waitForResponse(
        (response) =>
            response.request().method() === 'GET'
            && new URL(response.url()).pathname === `/projects/${projectId}/review-tasks`,
    );

    await openAuthenticatedRoute(page, `/projects/${projectId}/requirements`, E2E_REVIEWER_LOGIN_USERNAME);

    const response = await reviewTasksResponse;
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ requirementId: requireContext().requirement.id, status: 'pending' }),
        ]),
    );
});

Then('the review-task requirement should show a review action', async ({ page }) => {
    const row = page
        .getByRole('table', { name: 'Requirements' })
        .getByRole('row')
        .filter({ hasText: requireContext().requirement.visibleKey });
    await expect(row.getByRole('button', { name: 'Review this requirement' })).toBeVisible();
});

When('I open the review action for the review-task requirement', async ({ page }) => {
    const row = page
        .getByRole('table', { name: 'Requirements' })
        .getByRole('row')
        .filter({ hasText: requireContext().requirement.visibleKey });
    await row.getByRole('button', { name: 'Review this requirement' }).click();
});

Then('the review-task requirement review should be open', async ({ page }) => {
    const { projectId, requirement } = requireContext();
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/requirements/${requirement.id}/review$`));
});
