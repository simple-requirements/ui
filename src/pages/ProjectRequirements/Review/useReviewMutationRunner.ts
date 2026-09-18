import { useCallback, useState } from 'react';

import { queryClient } from '@/api/queryClient';
import { getReviewCommentsQueryKey, getReviewSummaryQueryKey } from '@/api/reviewApi';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import type { AppToastMessage } from '@/components/Feedback/toastEvents';
import { showToastMessage } from '@/components/Feedback/toastEvents';

export function useReviewMutationRunner(projectId: string | undefined, requirementId: string | undefined) {
    const [pending, setPending] = useState(false);

    const refreshReview = useCallback(async (): Promise<void> => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: getReviewCommentsQueryKey(projectId, requirementId) }),
            queryClient.invalidateQueries({ queryKey: getReviewSummaryQueryKey(projectId, requirementId) }),
        ]);
    }, [projectId, requirementId]);

    const runReviewAction = useCallback(
        async (action: () => Promise<unknown>, success: AppToastMessage): Promise<boolean> => {
            setPending(true);

            try {
                await action();
                await refreshReview();
                showToastMessage(success);
                return true;
            } catch (error) {
                showToastMessage(
                    toastMessages.reviewFailed(
                        error instanceof Error ? error.message : 'The review action could not be completed.',
                    ),
                );
                return false;
            } finally {
                setPending(false);
            }
        },
        [refreshReview],
    );

    return { pending, runReviewAction };
}
