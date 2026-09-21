import { useState } from 'react';
import { queryClient } from '@/api/queryClient';
import {
    getListProjectRequirementsQueryKey,
    getRequirementRevisionsQueryKey,
    markProjectRequirementImplementedRequest,
} from '@/api/requirementsApi';
import { setReviewActionRequirement, type ReviewActionRequirement } from '@/stores/actionBarStore';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import { showToastMessage } from '@/components/Feedback/toastEvents';

export function useImplementRequirementAction(requirement: ReviewActionRequirement | undefined) {
    const [pending, setPending] = useState(false);
    async function implement(): Promise<void> {
        if (requirement === undefined) return;
        setPending(true);
        try {
            const updated = await markProjectRequirementImplementedRequest(
                requirement.projectId,
                requirement.requirementId,
            );
            setReviewActionRequirement({
                projectId: updated.projectId,
                requirementId: updated.id,
                visibleKey: updated.visibleKey,
                status: updated.status,
                implementationTicketCount: updated.implementationTickets.length,
            });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: getListProjectRequirementsQueryKey(updated.projectId) }),
                queryClient.invalidateQueries({
                    queryKey: getRequirementRevisionsQueryKey(updated.projectId, updated.id),
                }),
            ]);
            showToastMessage(toastMessages.requirementImplemented(updated.visibleKey));
        } catch (error) {
            showToastMessage(
                toastMessages.requirementImplementedFailed(
                    error instanceof Error ? error.message : 'The status change could not be completed.',
                ),
            );
        } finally {
            setPending(false);
        }
    }
    return { pending, implement };
}
