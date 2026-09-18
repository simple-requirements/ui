import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useProjectDetails } from '@/pages/ProjectDetails/useProjectDetails';

const mocks = vi.hoisted(() => ({ useLiveQuery: vi.fn(), eq: vi.fn(), categories: {}, requirements: {} }));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery, eq: mocks.eq }));
vi.mock('@/api/collections/projectCategoriesCollection', () => ({
    getProjectCategoriesCollection: () => mocks.categories,
}));
vi.mock('@/api/collections/projectRequirementsCollection', () => ({
    getProjectRequirementsCollection: () => mocks.requirements,
}));
vi.mock('@/api/collections/projectsCollection', () => ({ projectsCollection: {} }));

afterEach(() => vi.clearAllMocks());

describe('useProjectDetails', () => {
    it('derives counts, status statistics, loading, and error state from collection queries', () => {
        mocks.useLiveQuery
            .mockReturnValueOnce({ data: { id: 'project-1', name: 'Project' }, isLoading: false, isError: false })
            .mockReturnValueOnce({ data: [{ id: 'c1' }, { id: 'c2' }], isLoading: false, isError: true })
            .mockReturnValueOnce({
                data: [
                    { id: 'r1', status: 'draft' },
                    { id: 'r2', status: 'approved' },
                    { id: 'r3', status: 'approved' },
                    { id: 'r4', status: 'implemented' },
                ],
                isLoading: true,
                isError: false,
            });

        const { result } = renderHook(() => useProjectDetails('project-1'));

        expect(result.current.categoriesCount).toBe(2);
        expect(result.current.requirementsCount).toBe(4);
        expect(result.current.requirementStatusStatistics).toEqual({
            draft: 1,
            approved: 2,
            implemented: 1,
            obsolete: 0,
            rejected: 0,
        });
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(true);
    });
});
