import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import { useReviewQueries } from '@/pages/ProjectRequirements/Review/useReviewQueries';

const mocks = vi.hoisted(() => ({ useLiveQuery: vi.fn(), useQuery: vi.fn(), collection: {}, eq: vi.fn() }));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery, eq: mocks.eq }));
vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactQueryModule>();

    return { ...actual, useQuery: mocks.useQuery };
});
vi.mock('@/api/collections/projectRequirementsCollection', () => ({
    getProjectRequirementsCollection: () => mocks.collection,
}));

afterEach(() => vi.clearAllMocks());

describe('useReviewQueries', () => {
    it('combines collection-backed requirement data with comments and summary query state', () => {
        mocks.useLiveQuery.mockReturnValue({ data: { id: 'requirement-1' }, isLoading: false, isError: false });
        mocks.useQuery
            .mockReturnValueOnce({ data: [{ id: 'comment-1' }], isLoading: true, isError: false })
            .mockReturnValueOnce({ data: { state: 'in_review' }, isLoading: false, isError: true });

        const { result } = renderHook(() => useReviewQueries('project-1', 'requirement-1'));

        expect(result.current.requirement).toEqual({ id: 'requirement-1' });
        expect(result.current.comments).toEqual([{ id: 'comment-1' }]);
        expect(result.current.summary).toEqual({ state: 'in_review' });
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(true);
    });

    it('disables remote review queries when route identifiers are incomplete', () => {
        mocks.useLiveQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });
        mocks.useQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });

        renderHook(() => useReviewQueries(undefined, undefined));

        expect(mocks.useQuery).toHaveBeenNthCalledWith(1, expect.objectContaining({ enabled: false }));
        expect(mocks.useQuery).toHaveBeenNthCalledWith(2, expect.objectContaining({ enabled: false }));
    });
});
