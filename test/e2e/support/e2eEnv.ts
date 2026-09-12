const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL = process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const E2E_ACCESS_TOKEN = process.env.E2E_ACCESS_TOKEN ?? 'e2e-authentication-token';
export const E2E_ADMIN_USER_ID = process.env.E2E_ADMIN_USER_ID ?? '10000000-0000-4000-8000-000000000001';
export const E2E_LOGIN_USERNAME = process.env.E2E_LOGIN_USERNAME ?? 'e2e-admin';
export const E2E_LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? 'correct horse battery staple';
export const E2E_REQUIREMENTS_ENGINEER_USER_ID =
    process.env.E2E_REQUIREMENTS_ENGINEER_USER_ID ?? '10000000-0000-4000-8000-000000000002';
export const E2E_DEVELOPER_USER_ID = process.env.E2E_DEVELOPER_USER_ID ?? '10000000-0000-4000-8000-000000000003';
export const E2E_VIEWER_USER_ID = process.env.E2E_VIEWER_USER_ID ?? '10000000-0000-4000-8000-000000000004';
export const E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN =
    process.env.E2E_REQUIREMENTS_ENGINEER_TOKEN ?? 'e2e-requirements-engineer-token';
export const E2E_DEVELOPER_ACCESS_TOKEN = process.env.E2E_DEVELOPER_TOKEN ?? 'e2e-developer-token';
export const E2E_VIEWER_ACCESS_TOKEN = process.env.E2E_VIEWER_TOKEN ?? 'e2e-viewer-token';
export const E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME =
    process.env.E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME ?? 'e2e-requirements-engineer';
export const E2E_DEVELOPER_LOGIN_USERNAME = process.env.E2E_DEVELOPER_LOGIN_USERNAME ?? 'e2e-developer';
export const E2E_VIEWER_LOGIN_USERNAME = process.env.E2E_VIEWER_LOGIN_USERNAME ?? 'e2e-viewer';

export function apiUrl(path: string): string {
    return new URL(path, API_BASE_URL).toString();
}
