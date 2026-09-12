import { useState } from 'react';

import { queryClient } from '@/api/queryClient';
import { getListProjectRequirementsQueryKey, markProjectRequirementObsoleteRequest } from '@/api/requirementsApi';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import { setReviewActionRequirement, type ReviewActionRequirement } from '@/stores/actionBarStore';
import { showToastMessage } from '@/stores/toastStore';

export function useObsoleteRequirementAction(requirement: ReviewActionRequirement | undefined) {
    const [visible, setVisible] = useState(false);
    const [pending, setPending] = useState(false);

    async function confirm(reason?: string): Promise<void> {
        if (requirement === undefined || reason === undefined) return;
        setPending(true);
        try {
            const updatedRequirement = await markProjectRequirementObsoleteRequest(
                requirement.projectId,
                requirement.requirementId,
                reason,
            );
            setReviewActionRequirement({
                projectId: updatedRequirement.projectId,
                requirementId: updatedRequirement.id,
                visibleKey: updatedRequirement.visibleKey,
                status: updatedRequirement.status,
            });
            await queryClient.invalidateQueries({
                queryKey: getListProjectRequirementsQueryKey(updatedRequirement.projectId),
            });
            setVisible(false);
            showToastMessage(toastMessages.requirementObsolete(updatedRequirement.visibleKey));
        } catch (error) {
            showToastMessage(
                toastMessages.requirementObsoleteFailed(
                    error instanceof Error ? error.message : 'The status change could not be completed.',
                ),
            );
        } finally {
            setPending(false);
        }
    }

    return { visible, pending, open: () => setVisible(true), abort: () => setVisible(false), confirm };
}
