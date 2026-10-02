import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    createRequirementLinkRequest,
    deleteRequirementLinkRequest,
    getRequirementLinksQueryKey,
    getRequirementLinksRequest,
    updateRequirementLinkRequest,
} from '@/api/requirementLinksApi';
import type * as FetchModule from '@/api/fetch';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();
    return { ...actual, apiFetch: mocks.apiFetch };
});

const link = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    relationshipType: 'references',
    source: {
        requirementId: '33333333-3333-4333-8333-333333333333',
        visibleKey: 'FR-AUTH-0001',
        type: 'FR',
        categoryId: '44444444-4444-4444-8444-444444444444',
        categoryName: 'Authentication',
        status: 'draft',
    },
    target: {
        requirementId: '55555555-5555-4555-8555-555555555555',
        visibleKey: 'NFR-PERF-0001',
        type: 'NFR',
        categoryId: '66666666-6666-4666-8666-666666666666',
        categoryName: 'Performance',
        status: 'approved',
    },
    createdAt: '2026-10-02T08:00:00.000Z',
    updatedAt: '2026-10-02T08:00:00.000Z',
} as const;

afterEach(() => vi.clearAllMocks());

describe('requirementLinksApi', () => {
    it('uses a requirement-scoped query key.', () => {
        expect(getRequirementLinksQueryKey('project-1', 'requirement-1')).toEqual([
            'projects',
            'project-1',
            'requirements',
            'requirement-1',
            'links',
        ]);
    });

    it('reads incoming and outgoing structured links.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: { outgoing: [link], incoming: [] } });
        await expect(getRequirementLinksRequest(link.projectId, link.source.requirementId)).resolves.toEqual({
            outgoing: [link],
            incoming: [],
        });
    });

    it('creates and corrects a link by visible target key.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: link });
        await createRequirementLinkRequest(link.projectId, link.source.requirementId, link.target.visibleKey);
        expect(mocks.apiFetch).toHaveBeenLastCalledWith(
            `/projects/${link.projectId}/requirements/${link.source.requirementId}/links`,
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ targetKey: link.target.visibleKey }) }),
        );

        await updateRequirementLinkRequest(link.projectId, link.source.requirementId, link.id, 'FR-DATA-0002');
        expect(mocks.apiFetch).toHaveBeenLastCalledWith(
            `/projects/${link.projectId}/requirements/${link.source.requirementId}/links/${link.id}`,
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ targetKey: 'FR-DATA-0002' }) }),
        );
    });

    it('removes a link without deleting either requirement.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: undefined });
        await deleteRequirementLinkRequest(link.projectId, link.source.requirementId, link.id);
        expect(mocks.apiFetch).toHaveBeenCalledWith(
            `/projects/${link.projectId}/requirements/${link.source.requirementId}/links/${link.id}`,
            { method: 'DELETE' },
        );
    });
});
