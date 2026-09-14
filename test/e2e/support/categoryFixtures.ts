import { E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN } from './e2eEnv';
import type { Category } from './e2eTypes';
import { jsonRequestForToken, requestJson } from './realBackendClient';

export async function createTestCategory(
    projectId: string,
    categoryData: Readonly<{ key: string; type: string; name: string }>,
): Promise<Category> {
    return requestJson<Category>(
        `/projects/${encodeURIComponent(projectId)}/categories`,
        jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'POST', {
            key: categoryData.key,
            type: categoryData.type,
            name: categoryData.name,
        }),
        201,
    );
}
