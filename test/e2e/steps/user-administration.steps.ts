import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { openAuthenticatedRoute, requireBackendAvailable } from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

Given('a real frontend Administrator session is available', async () => {
    await requireBackendAvailable();
});

When('I open frontend user administration as a real Administrator', async ({ page }) => {
    await openAuthenticatedRoute(page, '/admin/users');
    await expect(page).toHaveURL(/\/admin\/users$/u);
});

When('I select the Administrator user', async ({ page }) => {
    await page.getByRole('link', { name: 'Administrator', exact: true }).click();
});

Then('the selected user account details should be visible', async ({ page }) => {
    const details = page.getByRole('region', { name: 'Administrator' });

    await expect(details.getByRole('heading', { name: 'Administrator' })).toBeVisible();
    await expect(details.getByText('Email', { exact: true })).toBeVisible();
    await expect(details.getByText('Status', { exact: true })).toBeVisible();
    await expect(details.getByText('Role', { exact: true })).toBeVisible();
    await expect(details.getByRole('button', { name: 'Administrator' })).toBeVisible();
    await expect(page.getByText('@administrator')).toHaveCount(0);
    await expect(details.getByRole('heading', { name: 'Sessions', exact: true })).toHaveCount(0);
});
