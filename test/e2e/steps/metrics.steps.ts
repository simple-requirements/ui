import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

import {
    createTestCategory,
    createTestMetric,
    createTestProject,
    createTestRequirement,
    deactivateTestMetric,
    E2E_DEVELOPER_LOGIN_USERNAME,
    E2E_DEVELOPER_USER_ID,
    E2E_LOGIN_USERNAME,
    E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
    E2E_VIEWER_LOGIN_USERNAME,
    E2E_VIEWER_USER_ID,
    openAuthenticatedRoute,
    resetTestBackend,
    setProjectMembership,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

type TestRole = 'Requirements Engineer' | 'Developer' | 'Viewer' | 'Administrator';
type MetricContext = Readonly<{
    projectId: string;
    metricId?: string;
    requirementIds?: Readonly<Record<string, string>>;
    unresolvedRequirementId?: string;
}>;
let metricContext: MetricContext | undefined;

function requireContext(): MetricContext {
    if (metricContext === undefined) throw new Error('Metric test context has not been created.');
    return metricContext;
}

function usernameForRole(role: TestRole): string {
    switch (role) {
        case 'Requirements Engineer':
            return E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME;
        case 'Developer':
            return E2E_DEVELOPER_LOGIN_USERNAME;
        case 'Viewer':
            return E2E_VIEWER_LOGIN_USERNAME;
        case 'Administrator':
            return E2E_LOGIN_USERNAME;
    }
}

function metricRoute(): string {
    return `/projects/${requireContext().projectId}/metrics`;
}

function metricRow(page: Page, key: string) {
    return page.getByRole('table', { name: 'Metrics' }).getByRole('row').filter({ hasText: key });
}

// eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
Given('the backend contains a metric test project named {string}', async ({}, projectName: string) => {
    await resetTestBackend();
    const project = await createTestProject(projectName);
    metricContext = { projectId: project.id };
});

// eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
Given('the backend contains a metric test project named {string} with a metric', async ({}, projectName: string) => {
    await resetTestBackend();
    const project = await createTestProject(projectName);
    await createTestMetric(project.id, { value: '2000 ms', description: 'Maximum response time' });
    metricContext = { projectId: project.id };
});

Given('the Developer has membership in the metric test project', async () => {
    await setProjectMembership(requireContext().projectId, E2E_DEVELOPER_USER_ID);
});

Given('the Viewer has membership in the metric test project', async () => {
    await setProjectMembership(requireContext().projectId, E2E_VIEWER_USER_ID);
});

When('I open the metric list for the metric test project as a Requirements Engineer', async ({ page }) => {
    await openAuthenticatedRoute(page, metricRoute(), usernameForRole('Requirements Engineer'));
    await expect(
        page.getByRole('table', { name: 'Metrics' }).or(page.getByText('No metrics available.')),
    ).toBeVisible();
});

When('I open the metric list for the metric test project as the Developer', async ({ page }) => {
    await openAuthenticatedRoute(page, metricRoute(), usernameForRole('Developer'));
});

When('I open the metric list for the metric test project as the Viewer', async ({ page }) => {
    await openAuthenticatedRoute(page, metricRoute(), usernameForRole('Viewer'));
});

When('I open the metric list for the metric test project as an Administrator', async ({ page }) => {
    await openAuthenticatedRoute(page, metricRoute(), usernameForRole('Administrator'));
});

When(
    'I create a metric with value {string} and description {string}',
    async ({ page }, value: string, description: string) => {
        await page.getByRole('button', { name: 'New metric' }).click();
        await page.getByLabel('Value').fill(value);
        await page.getByLabel('Description').fill(description);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByRole('heading', { name: 'Metric MET-0001' })).toBeVisible();
        await page.getByRole('link', { name: 'Metrics', exact: true }).click();
        await expect(page).toHaveURL(metricRoute());
    },
);

When(
    'I edit metric {string} to value {string} and description {string}',
    async ({ page }, key: string, value: string, description: string) => {
        await metricRow(page, key).click();
        await page.getByRole('button', { name: 'Edit' }).click();
        await expect(page.getByLabel('Key')).toBeDisabled();
        await page.getByLabel('Value').fill(value);
        await page.getByLabel('Description').fill(description);
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('link', { name: 'Metrics', exact: true }).click();
        await expect(page).toHaveURL(metricRoute());
    },
);

When('I deactivate metric {string}', async ({ page }, key: string) => {
    await metricRow(page, key).click();
    await page.getByRole('button', { name: 'Deactivate', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Deactivate', exact: true }).click();
});

Then('metric {string} should be visible with value {string}', async ({ page }, key: string, value: string) => {
    await expect(metricRow(page, key)).toContainText(value);
});

Then('metric {string} should be shown as deactivated', async ({ page }, key: string) => {
    await expect(metricRow(page, key)).toContainText('Deactivated');
});

Then('metric mutation controls should not be visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New metric' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Deactivate' })).toHaveCount(0);
});

Then('project metric content should not be accessible', async ({ page }) => {
    await expect(page).toHaveURL(/\/$/u);
    await expect(page.getByRole('table', { name: 'Metrics' })).toHaveCount(0);
});

Given(
    'the backend contains a metric integration project named {string} with two referencing requirements',
    // eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
    async ({}, projectName: string) => {
        await resetTestBackend();
        const project = await createTestProject(projectName);
        const category = await createTestCategory(project.id, { key: 'PERF', type: 'NFR', name: 'Performance' });
        const metric = await createTestMetric(project.id, { value: '2000 ms', description: 'Maximum response time' });
        const first = await createTestRequirement(project.id, {
            categoryId: category.id,
            description: 'Response time shall be below [~MET-0001].',
            priority: null,
            owner: null,
            rationale: null,
            source: null,
        });
        const second = await createTestRequirement(project.id, {
            categoryId: category.id,
            description: 'Batch response shall be below [~MET-0001] and remain below [~MET-0001].',
            priority: null,
            owner: null,
            rationale: null,
            source: null,
        });
        metricContext = {
            projectId: project.id,
            metricId: metric.id,
            requirementIds: { [first.visibleKey]: first.id, [second.visibleKey]: second.id },
        };
    },
);

Given(
    'the backend contains a metric integration project named {string} with a deactivated referenced metric',
    // eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
    async ({}, projectName: string) => {
        await resetTestBackend();
        const project = await createTestProject(projectName);
        const category = await createTestCategory(project.id, { key: 'PERF', type: 'NFR', name: 'Performance' });
        const metric = await createTestMetric(project.id, { value: '2000 ms', description: 'Maximum response time' });
        const requirement = await createTestRequirement(project.id, {
            categoryId: category.id,
            description: 'Response time shall be below [~MET-0001].',
            priority: null,
            owner: null,
            rationale: null,
            source: null,
        });
        await deactivateTestMetric(project.id, metric.id);
        metricContext = {
            projectId: project.id,
            metricId: metric.id,
            requirementIds: { [requirement.visibleKey]: requirement.id },
        };
    },
);

Given(
    'the backend contains a metric integration project named {string} with an unresolved metric requirement',
    // eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
    async ({}, projectName: string) => {
        await resetTestBackend();
        const project = await createTestProject(projectName);
        const category = await createTestCategory(project.id, { key: 'PERF', type: 'NFR', name: 'Performance' });
        const requirement = await createTestRequirement(project.id, {
            categoryId: category.id,
            description: 'Response time shall be below [~MET-9999].',
            priority: null,
            owner: null,
            rationale: null,
            source: null,
        });
        metricContext = { projectId: project.id, unresolvedRequirementId: requirement.id };
    },
);

When('I open the requirements for the metric integration project as a Requirements Engineer', async ({ page }) => {
    await openAuthenticatedRoute(
        page,
        `/projects/${requireContext().projectId}/requirements`,
        usernameForRole('Requirements Engineer'),
    );
    await expect(page.getByRole('table', { name: 'Requirements' })).toBeVisible();
});

Then('metric reference {string} should render current value {string}', async ({ page }, key: string, value: string) => {
    await expect(page.getByRole('link', { name: `${key}: ${value}. Open metric details.` }).first()).toBeVisible();
    await expect(page.getByText(`[~${key}]`)).toHaveCount(0);
});

When('I open metric reference {string} from the requirement', async ({ page }, key: string) => {
    const link = page.getByRole('link', { name: new RegExp(`^${key}:`, 'u') }).first();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/metrics/${requireContext().metricId ?? ''}$`, 'u'));
});

Then('the metric detail should show usage count {int}', async ({ page }, count: number) => {
    const row = page.getByText('Usage count').locator('..');
    await expect(row).toContainText(String(count));
});

Then(
    'the metric detail should list referencing requirements {string} and {string}',
    async ({ page }, firstKey: string, secondKey: string) => {
        await expect(page.getByRole('link', { name: firstKey })).toBeVisible();
        await expect(page.getByRole('link', { name: secondKey })).toBeVisible();
    },
);

When('I update the open metric value to {string}', async ({ page }, value: string) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Value').fill(value);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(value)).toBeVisible();
});

When('I open referencing requirement {string} from the metric detail', async ({ page }, requirementKey: string) => {
    await page.getByRole('link', { name: requirementKey }).click();
    const requirementId = requireContext().requirementIds?.[requirementKey];
    if (requirementId === undefined)
        throw new Error(`Requirement ${requirementKey} is not in the metric test context.`);
    await expect(page).toHaveURL(new RegExp(`/requirements/${requirementId}$`, 'u'));
});

Then('the requirement detail should render metric value {string}', async ({ page }, value: string) => {
    await expect(page.getByRole('region', { name: 'Requirement details' })).toContainText(value);
});

When('I open the unresolved requirement review as a Requirements Engineer', async ({ page }) => {
    const context = requireContext();
    if (context.unresolvedRequirementId === undefined) throw new Error('Unresolved requirement was not created.');
    await openAuthenticatedRoute(
        page,
        `/projects/${context.projectId}/requirements/${context.unresolvedRequirementId}/review`,
        usernameForRole('Requirements Engineer'),
    );
});

Then('the review should show unresolved metric reference {string}', async ({ page }, key: string) => {
    await expect(page.getByRole('alert')).toContainText(`Unresolved metric references block approval: ${key}.`);
    await expect(page.getByText(`[~${key}]`)).toBeVisible();
});
