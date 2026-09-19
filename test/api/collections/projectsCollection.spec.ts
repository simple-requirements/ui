import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { projectsCollection, resetProjectsCollection } from '@/api/collections/projectsCollection';
import { queryClient } from '@/api/queryClient';

import type { Project } from '@/api/projectsApi';

const project: Project = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Atlas',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
    requirementCount: 4,
    ticketUrlTemplate: null,
};

type ProjectsCollectionOptions = Readonly<{
    id: string;
    queryKey: readonly string[];
    queryClient: typeof queryClient;
    getKey: (projectValue: Project) => string;
    schema: unknown;
    queryFn: () => Promise<Project[]>;
}>;

const mocks = vi.hoisted(() => ({
    createCollection: vi.fn((options: unknown) => ({
        collectionOptions: options,
        cleanup: vi.fn().mockResolvedValue(undefined),
    })),
    queryCollectionOptions: vi.fn((options: unknown) => options),
    listProjectsRequest: vi.fn<() => Promise<Project[]>>(),
}));

vi.mock('@tanstack/react-db', () => ({ createCollection: mocks.createCollection }));
vi.mock('@tanstack/query-db-collection', () => ({ queryCollectionOptions: mocks.queryCollectionOptions }));
vi.mock('@/api/generated/projects/projects', () => ({ getListProjectsQueryKey: () => ['/projects'] as const }));
vi.mock('@/api/projectsApi', () => ({ projectSchema: {}, listProjectsRequest: mocks.listProjectsRequest }));

beforeEach(async () => {
    vi.clearAllMocks();
    await resetProjectsCollection();
});

afterEach(() => {
    vi.clearAllMocks();
});

function getCollectionOptions(): ProjectsCollectionOptions {
    return mocks.queryCollectionOptions.mock.calls.at(-1)?.[0] as ProjectsCollectionOptions;
}

describe('projectsCollection', () => {
    it('configures the collection with the project query.', () => {
        expect(getCollectionOptions()).toEqual(
            expect.objectContaining({ id: 'projects', queryKey: ['/projects'], queryClient }),
        );
    });

    it('uses the project id as collection key.', () => {
        expect(getCollectionOptions().getKey(project)).toBe(project.id);
    });

    it('loads projects through the domain-facing API wrapper.', async () => {
        mocks.listProjectsRequest.mockResolvedValue([project]);

        await expect(getCollectionOptions().queryFn()).resolves.toEqual([project]);
        expect(mocks.listProjectsRequest).toHaveBeenCalledOnce();
    });

    it('cleans up and recreates the global collection at an authentication boundary.', async () => {
        const previousCollection = projectsCollection;

        await resetProjectsCollection();

        expect(previousCollection.cleanup.mock.calls).toHaveLength(1);
        expect(projectsCollection).not.toBe(previousCollection);
    });
});
