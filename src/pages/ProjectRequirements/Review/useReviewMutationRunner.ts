import { useCallback, useState } from "react";

import { queryClient } from "@/api/queryClient";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import type { AppToastMessage } from "@/stores/toastStore";
import { showToastMessage } from "@/stores/toastStore";

export function useReviewMutationRunner(
  projectId: string | undefined,
  requirementId: string | undefined,
) {
  const [pending, setPending] = useState(false);

  const refreshReview = useCallback(async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["review-comments", projectId, requirementId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["review-summary", projectId, requirementId],
      }),
    ]);
  }, [projectId, requirementId]);

  const runReviewAction = useCallback(
    async (
      action: () => Promise<unknown>,
      success: AppToastMessage,
    ): Promise<boolean> => {
      setPending(true);

      try {
        await action();
        await refreshReview();
        showToastMessage(success);
        return true;
      } catch (error) {
        showToastMessage(
          toastMessages.reviewFailed(
            error instanceof Error
              ? error.message
              : "The review action could not be completed.",
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
