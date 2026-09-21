import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useReviewMutationRunner } from '@/pages/ProjectRequirements/Review/useReviewMutationRunner';

const mocks = vi.hoisted(() => ({ invalidateQueries: vi.fn(), showToastMessage: vi.fn() }));

vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/components/Feedback/toastEvents', () => ({ showToastMessage: mocks.showToastMessage }));

afterEach(() => vi.clearAllMocks());

describe('useReviewMutationRunner', () => {
    it('refreshes review queries and shows the success toast after a successful action', async () => {
        mocks.invalidateQueries.mockResolvedValue(undefined);
        const success = { severity: 'success' as const, summary: 'Done' };
        const action = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useReviewMutationRunner('project-1', 'requirement-1'));

        let succeeded = false;
        await act(async () => {
            succeeded = await result.current.runReviewAction(action, success);
        });

        expect(succeeded).toBe(true);
        expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);
        expect(mocks.showToastMessage).toHaveBeenCalledWith(success);
        expect(result.current.pending).toBe(false);
    });

    it('returns false and reports an action failure without refreshing', async () => {
        const action = vi.fn().mockRejectedValue(new Error('Denied'));
        const { result } = renderHook(() => useReviewMutationRunner('project-1', 'requirement-1'));

        let succeeded = true;
        await act(async () => {
            succeeded = await result.current.runReviewAction(action, { severity: 'success', summary: 'Done' });
        });

        expect(succeeded).toBe(false);
        expect(mocks.invalidateQueries).not.toHaveBeenCalled();
        expect(mocks.showToastMessage).toHaveBeenCalledOnce();
        expect(result.current.pending).toBe(false);
    });
});
