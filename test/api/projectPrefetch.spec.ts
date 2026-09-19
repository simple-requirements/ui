import { afterEach, describe, expect, it, vi } from 'vitest';

type QueryOptions = Readonly<{
    queryKey: readonly unknown[];
    queryFn: () => Promise<unknown>;
}>;

const mocks = vi.hoisted(() => ({
    getListProjectCategoriesQueryKey: vi.fn(() => ['categories', 'project-alpha'] as const),
    getListProjectRequirementsQueryKey: vi.fn(() => ['requirements', 'project-alpha'] as const),
    listProjectCategoriesRequest: vi.fn(() => Promise.resolve([])),
    listProjectRequirementsRequest: vi.fn(() => Promise.resolve([])),
    query: vi.fn<(options: QueryOptions) => Promise<unknown>>(async (options) => options.queryFn()),
}));

vi.mock('@/api/categoriesApi', () => ({
    getListProjectCategoriesQueryKey: mocks.getListProjectCategoriesQueryKey,
    listProjectCategoriesRequest: mocks.listProjectCategoriesRequest,
}));

vi.mock('@/api/requirementsApi', () => ({
    getListProjectRequirementsQueryKey: mocks.getListProjectRequirementsQueryKey,
    listProjectRequirementsRequest: mocks.listProjectRequirementsRequest,
}));

vi.mock('@/api/queryClient', () => ({ queryClient: { query: mocks.query } }));

import {
    prefetchProjectCategories,
    prefetchProjectDetails,
    prefetchProjectRequirements,
} from '@/api/projectPrefetch';

afterEach(() => {
    vi.clearAllMocks();
    mocks.query.mockImplementation(async (options) => options.queryFn());
});

describe('projectPrefetch', () => {
    it('prefetches project requirements with the collection backing query key.', async () => {
        await prefetchProjectRequirements('project-alpha');

        expect(mocks.getListProjectRequirementsQueryKey).toHaveBeenCalledWith('project-alpha');
        expect(mocks.listProjectRequirementsRequest).toHaveBeenCalledWith('project-alpha');
        expect(mocks.query).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ['requirements', 'project-alpha'] }),
        );
    });

    it('prefetches project categories with the collection backing query key.', async () => {
        await prefetchProjectCategories('project-alpha');

        expect(mocks.getListProjectCategoriesQueryKey).toHaveBeenCalledWith('project-alpha');
        expect(mocks.listProjectCategoriesRequest).toHaveBeenCalledWith('project-alpha');
        expect(mocks.query).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ['categories', 'project-alpha'] }),
        );
    });

    it('prefetches both datasets required by project details.', async () => {
        await prefetchProjectDetails('project-alpha');

        expect(mocks.listProjectCategoriesRequest).toHaveBeenCalledWith('project-alpha');
        expect(mocks.listProjectRequirementsRequest).toHaveBeenCalledWith('project-alpha');
    });

    it('does not surface speculative prefetch failures.', async () => {
        mocks.query.mockRejectedValueOnce(new Error('offline'));

        await expect(prefetchProjectRequirements('project-alpha')).resolves.toBeUndefined();
    });
});
