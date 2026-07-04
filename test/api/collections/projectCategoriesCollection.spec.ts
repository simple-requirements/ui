import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { queryClient } from '@/api/queryClient';

import type { Category } from '@/api/categoriesApi';

const category: Category = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    name: 'Authentication',
    key: 'AUTH',
    type: 'FR',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
    requirementCount: 3,
};

type ProjectCategoriesCollectionOptions = Readonly<{
    id: string;
    queryKey: readonly string[];
    queryClient: typeof queryClient;
    getKey: (categoryValue: Category) => string;
    schema: unknown;
    queryFn: () => Promise<Category[]>;
    retry: boolean;
}>;

const mocks = vi.hoisted(() => ({
    createCollection: vi.fn((options: unknown) => ({ collectionOptions: options })),
    queryCollectionOptions: vi.fn((options: unknown) => options),
    listProjectCategoriesRequest: vi.fn<() => Promise<Category[]>>(),
}));

vi.mock('@tanstack/react-db', () => ({ createCollection: mocks.createCollection }));
vi.mock('@tanstack/query-db-collection', () => ({ queryCollectionOptions: mocks.queryCollectionOptions }));
vi.mock('@/api/categoriesApi', () => ({
    categorySchema: {},
    getListProjectCategoriesQueryKey: (projectId: string) => ['/projects', projectId, 'categories'] as const,
    listProjectCategoriesRequest: mocks.listProjectCategoriesRequest,
}));

afterEach(() => {
    vi.clearAllMocks();
});

function getCollectionOptions(): ProjectCategoriesCollectionOptions {
    return mocks.queryCollectionOptions.mock.calls[0]?.[0] as ProjectCategoriesCollectionOptions;
}

describe('projectCategoriesCollection', () => {
    it('creates and caches a category collection per project.', () => {
        const firstCollection = getProjectCategoriesCollection('project-alpha');
        const secondCollection = getProjectCategoriesCollection('project-alpha');
        const otherCollection = getProjectCategoriesCollection('project-beta');

        expect(firstCollection).toBe(secondCollection);
        expect(firstCollection).not.toBe(otherCollection);
        expect(mocks.createCollection).toHaveBeenCalledTimes(2);
    });

    it('configures the collection with the project category query.', () => {
        getProjectCategoriesCollection('project-config');

        expect(mocks.queryCollectionOptions).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'project-categories:project-config',
                queryKey: ['/projects', 'project-config', 'categories'],
                queryClient,
                retry: false,
            }),
        );
    });

    it('uses the category id as collection key.', () => {
        getProjectCategoriesCollection('project-key');

        expect(getCollectionOptions().getKey(category)).toBe(category.id);
    });

    it('loads categories for the configured project id.', async () => {
        mocks.listProjectCategoriesRequest.mockResolvedValue([category]);

        getProjectCategoriesCollection('project-query');

        await expect(getCollectionOptions().queryFn()).resolves.toEqual([category]);
        expect(mocks.listProjectCategoriesRequest).toHaveBeenCalledWith('project-query');
    });
});
