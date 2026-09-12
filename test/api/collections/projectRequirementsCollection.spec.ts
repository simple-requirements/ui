import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { queryClient } from '@/api/queryClient';

import type { Requirement } from '@/api/requirementsApi';

const requirement: Requirement = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    categoryId: '33333333-3333-4333-8333-333333333333',
    sequenceNumber: 1,
    revisionNumber: 1,
    visibleKey: 'FR-AUTH-0001',
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
    obsoletedBy: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    implementationTickets: [],
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-28T10:00:00.000Z',
};

type ProjectRequirementsCollectionOptions = Readonly<{
    id: string;
    queryKey: readonly string[];
    queryClient: typeof queryClient;
    getKey: (requirementValue: Requirement) => string;
    schema: unknown;
    queryFn: () => Promise<Requirement[]>;
    retry: boolean;
}>;

const mocks = vi.hoisted(() => ({
    createCollection: vi.fn((options: unknown) => ({ collectionOptions: options })),
    queryCollectionOptions: vi.fn((options: unknown) => options),
    listProjectRequirementsRequest: vi.fn<() => Promise<Requirement[]>>(),
}));

vi.mock('@tanstack/react-db', () => ({ createCollection: mocks.createCollection }));
vi.mock('@tanstack/query-db-collection', () => ({ queryCollectionOptions: mocks.queryCollectionOptions }));
vi.mock('@/api/requirementsApi', () => ({
    requirementSchema: {},
    getListProjectRequirementsQueryKey: (projectId: string) => [`/projects/${projectId}/requirements`] as const,
    listProjectRequirementsRequest: mocks.listProjectRequirementsRequest,
}));

afterEach(() => {
    vi.clearAllMocks();
});

function getCollectionOptions(): ProjectRequirementsCollectionOptions {
    return mocks.queryCollectionOptions.mock.calls[0]?.[0] as ProjectRequirementsCollectionOptions;
}

describe('projectRequirementsCollection', () => {
    it('creates and caches a requirements collection per project.', () => {
        const firstCollection = getProjectRequirementsCollection('project-alpha');
        const secondCollection = getProjectRequirementsCollection('project-alpha');
        const otherCollection = getProjectRequirementsCollection('project-beta');

        expect(firstCollection).toBe(secondCollection);
        expect(firstCollection).not.toBe(otherCollection);
        expect(mocks.createCollection).toHaveBeenCalledTimes(2);
    });

    it('configures the collection with the project requirements query.', () => {
        getProjectRequirementsCollection('project-config');

        expect(mocks.queryCollectionOptions).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'project-requirements:project-config',
                queryKey: ['/projects/project-config/requirements'],
                queryClient,
                retry: false,
            }),
        );
    });

    it('uses the requirement id as collection key.', () => {
        getProjectRequirementsCollection('project-key');

        expect(getCollectionOptions().getKey(requirement)).toBe(requirement.id);
    });

    it('loads requirements for the configured project id.', async () => {
        mocks.listProjectRequirementsRequest.mockResolvedValue([requirement]);

        getProjectRequirementsCollection('project-query');

        await expect(getCollectionOptions().queryFn()).resolves.toEqual([requirement]);
        expect(mocks.listProjectRequirementsRequest).toHaveBeenCalledWith('project-query');
    });
});
