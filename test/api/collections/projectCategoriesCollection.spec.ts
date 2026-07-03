import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';

const mocks = vi.hoisted(() => ({
    createCollection: vi.fn((options: unknown) => ({ collectionOptions: options })),
    queryCollectionOptions: vi.fn((options: unknown) => options),
}));

vi.mock('@tanstack/react-db', () => ({ createCollection: mocks.createCollection }));
vi.mock('@tanstack/query-db-collection', () => ({ queryCollectionOptions: mocks.queryCollectionOptions }));

afterEach(() => {
    vi.clearAllMocks();
});

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
                retry: false,
            }),
        );
    });
});
