import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as FetchModule from '@/api/fetch';
import {
    getListProjectRequirementsQueryKey,
    listProjectRequirementsRequest,
    requirementSchema,
} from '@/api/requirementsApi';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();

    return { ...actual, apiFetch: mocks.apiFetch };
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('requirementsApi', () => {
    it('creates the list query key.', () => {
        expect(getListProjectRequirementsQueryKey('project-alpha')).toEqual(['/projects/project-alpha/requirements']);
    });

    it('parses a requirement.', () => {
        const requirement = requirementSchema.parse({
            id: '11111111-1111-4111-8111-111111111111',
            projectId: '22222222-2222-4222-8222-222222222222',
            categoryId: '33333333-3333-4333-8333-333333333333',
            revisionNumber: 2,
            visibleKey: 'FR-AUTH-0001',
            status: 'approved',
            description: 'Users can sign in.',
            priority: 'p1',
            owner: 'Alice',
            rationale: null,
            source: null,
            rejectionReason: null,
            reviewer: 'Bob',
            rejectedAt: null,
            deletedAt: null,
            approvedAt: '2026-06-29T11:00:00.000Z',
            implementedAt: null,
            obsolescenceReason: null,
            obsoleteAt: null,
            createdAt: '2026-06-28T10:00:00.000Z',
            updatedAt: '2026-06-29T11:30:00.000Z',
        });

        expect(requirement.visibleKey).toBe('FR-AUTH-0001');
        expect(requirement.status).toBe('approved');
    });

    it('lists and parses project requirements.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    projectId: '22222222-2222-4222-8222-222222222222',
                    categoryId: '33333333-3333-4333-8333-333333333333',
                    revisionNumber: 1,
                    visibleKey: 'NFR-PERF-0001',
                    status: 'draft',
                    description: null,
                    priority: null,
                    owner: null,
                    rationale: null,
                    source: null,
                    rejectionReason: null,
                    reviewer: null,
                    rejectedAt: null,
                    deletedAt: null,
                    approvedAt: null,
                    implementedAt: null,
                    obsolescenceReason: null,
                    obsoleteAt: null,
                    createdAt: '2026-06-28T10:00:00.000Z',
                    updatedAt: '2026-06-28T10:00:00.000Z',
                },
            ],
            status: 200,
            headers: new Headers(),
        });

        await expect(listProjectRequirementsRequest('project alpha')).resolves.toEqual([
            expect.objectContaining({
                id: '11111111-1111-4111-8111-111111111111',
                visibleKey: 'NFR-PERF-0001',
                status: 'draft',
            }),
        ]);

        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project alpha/requirements', { method: 'GET' });
    });
});
