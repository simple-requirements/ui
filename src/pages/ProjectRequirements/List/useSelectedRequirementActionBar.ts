import { useEffect } from 'react';

import { clearReviewActionRequirement, setReviewActionRequirement } from '@/stores/actionBarStore';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';

export function useSelectedRequirementActionBar(
    projectId: string | undefined,
    selectedRequirement: RequirementTableRow | undefined,
): void {
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
        });
        return clearReviewActionRequirement;
    }, [projectId, selectedRequirement]);
}
