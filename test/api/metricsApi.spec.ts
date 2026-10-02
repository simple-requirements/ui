import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    createMetricRequestSchema,
    createProjectMetricRequest,
    deactivateProjectMetricRequest,
    getListProjectMetricsQueryKey,
    listProjectMetricsRequest,
    updateProjectMetricRequest,
} from '@/api/metricsApi';
import type * as FetchModule from '@/api/fetch';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();
    return { ...actual, apiFetch: mocks.apiFetch };
});

const metricResponse = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    key: 'MET-0001',
    value: '2000 ms',
    description: 'Response time',
    active: true,
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
};

afterEach(() => vi.clearAllMocks());

describe('metricsApi', () => {
    it('uses a project-scoped list query key.', () => {
        expect(getListProjectMetricsQueryKey('project-alpha')).toEqual(['/projects/project-alpha/metrics']);
    });

    it('requires a non-empty trimmed metric value.', () => {
        expect(createMetricRequestSchema.safeParse({ value: '   ', description: '' }).success).toBe(false);
        expect(createMetricRequestSchema.parse({ value: ' 99.9 % ', description: ' Availability ' })).toEqual({
            value: '99.9 %',
            description: 'Availability',
        });
    });

    it('lists project metrics through the generated client.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: [metricResponse], status: 200, headers: new Headers() });
        await expect(listProjectMetricsRequest('project alpha')).resolves.toEqual([metricResponse]);
        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project alpha/metrics', { method: 'GET' });
    });

    it('creates metrics without sending a client-selected key.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: metricResponse, status: 201, headers: new Headers() });
        await createProjectMetricRequest('project alpha', { value: '2000 ms', description: 'Response time' });
        const [, request] = mocks.apiFetch.mock.calls[0] as [string, RequestInit];
        if (typeof request.body !== 'string') throw new Error('Expected a JSON string request body.');
        expect(JSON.parse(request.body)).toEqual({ value: '2000 ms', description: 'Response time' });
        expect(JSON.parse(request.body)).not.toHaveProperty('key');
    });

    it('updates and deactivates a metric through the generated client.', async () => {
        mocks.apiFetch
            .mockResolvedValueOnce({
                data: { ...metricResponse, value: '1000 ms' },
                status: 200,
                headers: new Headers(),
            })
            .mockResolvedValueOnce({ data: { ...metricResponse, active: false }, status: 200, headers: new Headers() });
        await updateProjectMetricRequest('project alpha', 'metric one', {
            value: '1000 ms',
            description: 'Response time',
        });
        await deactivateProjectMetricRequest('project alpha', 'metric one');
        expect(mocks.apiFetch).toHaveBeenLastCalledWith('/projects/project alpha/metrics/metric one/deactivate', {
            method: 'POST',
        });
    });
});
