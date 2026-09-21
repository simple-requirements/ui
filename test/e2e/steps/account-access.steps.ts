import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { listUsers, requireBackendAvailable } from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

let registeredAccount: Readonly<{ username: string; email: string; displayName: string }> | undefined;

function uniqueAccount(): Readonly<{ username: string; email: string; displayName: string }> {
    const suffix = `${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
    const username = `alice-${suffix}`.slice(0, 64);
    return { username, email: `${username}@example.invalid`, displayName: `Alice ${suffix}` };
}

Given('the real public account API is available', async () => {
    registeredAccount = undefined;
    await requireBackendAvailable();
});

When('I register a unique local frontend account', async ({ page }) => {
    registeredAccount = uniqueAccount();
    await page.goto('/register');
    await page.getByLabel('Username').fill(` ${registeredAccount.username} `);
    await page.getByLabel('Email address').fill(` ${registeredAccount.email.toUpperCase()} `);
    await page.getByLabel('Display name').fill(` ${registeredAccount.displayName} `);
    await page.getByLabel('Password', { exact: true }).fill('correct horse battery staple');
    await page.getByLabel('Confirm password').fill('correct horse battery staple');
    await page.getByRole('button', { name: 'Register' }).click();
});

Then('the registration instructions should be visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Registration received' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Administrator must activate');
});

Then('the normalized registration data should be visible to administration', async () => {
    if (registeredAccount === undefined) throw new Error('No account was registered.');
    const users = await listUsers();
    const user = users.find((candidate) => candidate.username === registeredAccount?.username);
    expect(user).toBeDefined();
    expect(user?.email).toBe(registeredAccount.email);
    expect(user?.displayName).toBe(registeredAccount.displayName);
    expect(user?.status).toBe('pending');
});

When('I open an invalid frontend email-verification link', async ({ page }) => {
    await page.goto(`/verify-email?token=invalid-${String(Date.now())}`);
});

Then('the email-verification invalid-link message should be visible', async ({ page }) => {
    await expect(page.getByRole('alert')).toContainText('verification link is invalid or has expired');
});

When('I request another frontend verification email', async ({ page }) => {
    await page.goto('/verify-email/resend');
    await page.getByLabel('Username').fill(`unknown-${String(Date.now())}`);
    await page.getByRole('button', { name: 'Send verification email' }).click();
});

Then('the generic verification-email response should be visible', async ({ page }) => {
    await expect(page.getByRole('status')).toContainText('If the account is eligible');
});

When('I request a frontend password reset', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel('Email address').fill(`unknown-${String(Date.now())}@example.invalid`);
    await page.getByRole('button', { name: 'Send reset email' }).click();
});

Then('the generic password-reset response should be visible', async ({ page }) => {
    await expect(page.getByRole('status')).toContainText('If the account is eligible');
});

When('I open an invalid frontend password-reset link', async ({ page }) => {
    await page.goto(`/reset-password?token=invalid-${String(Date.now())}`);
});

When('I submit a new frontend password', async ({ page }) => {
    await page.getByLabel('New password', { exact: true }).fill('new correct horse battery staple');
    await page.getByLabel('Confirm new password').fill('new correct horse battery staple');
    await page.getByRole('button', { name: 'Change password' }).click();
});

Then('the password-reset invalid-link message should be visible', async ({ page }) => {
    await expect(page.getByRole('alert')).toContainText('password-reset link is invalid');
});
