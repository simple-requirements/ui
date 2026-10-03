import { useEffect } from 'react';

import { clearReviewActionRequirement, setReviewActionRequirement } from '@/stores/actionBarStore';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';
import { useRequirementReviewAssignment } from '@/pages/ProjectRequirements/Review/useRequirementReviewAssignment';

export function useSelectedRequirementActionBar(
    projectId: string | undefined,
    selectedRequirement: RequirementTableRow | undefined,
): void {
    const assignment = useRequirementReviewAssignment(projectId, selectedRequirement?.id);

    useEffect(() => {
        if (projectId === undefined || selectedRequirement === undefined) {
            clearReviewActionRequirement();
            return clearReviewActionRequirement;
        }

        setReviewActionRequirement({
            projectId,
            requirementId: selectedRequirement.id,
            visibleKey: selectedRequirement.visibleKey,
            status: selectedRequirement.status,
            hasAssignedReviewer: assignment.hasAssignedReviewer,
            assignedToCurrentUser: assignment.assignedToCurrentUser,
        });
        return clearReviewActionRequirement;
    }, [assignment.assignedToCurrentUser, assignment.hasAssignedReviewer, projectId, selectedRequirement]);
}
