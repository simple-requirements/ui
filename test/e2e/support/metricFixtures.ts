import { E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN } from './e2eEnv';
import type { Metric } from './e2eTypes';
import { jsonRequestForToken, requestJson } from './realBackendClient';

export async function createTestMetric(
    projectId: string,
    input: Readonly<{ value: string; description: string }>,
): Promise<Metric> {
    return requestJson<Metric>(
        `/projects/${encodeURIComponent(projectId)}/metrics`,
        jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'POST', input),
        201,
    );
}

export async function deactivateTestMetric(projectId: string, metricId: string): Promise<Metric> {
    return requestJson<Metric>(
        `/projects/${encodeURIComponent(projectId)}/metrics/${encodeURIComponent(metricId)}/deactivate`,
        jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'POST', {}),
        [200, 201],
    );
}
