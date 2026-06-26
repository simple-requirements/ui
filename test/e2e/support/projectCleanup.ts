import type { APIRequestContext } from '@playwright/test';

export const backendApiBaseUrl = () =>
    (process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export async function resetBackendDatabase(request: APIRequestContext): Promise<void> {
    const response = await request.post(`${backendApiBaseUrl()}/testing/e2e/reset-database`);

    if (response.ok()) return;

    throw new Error(`E2E database reset failed: ${response.status()} ${await response.text()}`);
}
