import { useNavigate } from 'react-router';

import { getReviewSummary } from '@/api/reviewApi';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import { getProjectRequirementDetailsRoute, getProjectRequirementReviewRoute } from '@/router/projectRoutes';
import { clearReviewActionRequirement, setReviewActionRequirement } from '@/stores/actionBarStore';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';

type Options = Readonly<{
    projectId: string | undefined;
    requirements: readonly RequirementTableRow[];
    setSelectedRequirementId: (id: string) => void;
}>;

export type RequirementListActions = Readonly<{
    copyRequirementKey: (requirement: RequirementTableRow) => Promise<void>;
    selectRequirement: (requirementId: string) => void;
    openRequirement: (requirement: RequirementTableRow) => void;
}>;

export function useRequirementListActions({
    projectId,
    requirements,
    setSelectedRequirementId,
}: Options): RequirementListActions {
    const navigate = useNavigate();
    async function copyRequirementKey(requirement: RequirementTableRow): Promise<void> {
        await navigator.clipboard.writeText(requirement.visibleKey);
        showToastMessage(toastMessages.requirementKeyCopied(requirement.visibleKey));
    }
    function selectRequirement(requirementId: string): void {
        setSelectedRequirementId(requirementId);
        const requirement = requirements.find((current) => current.id === requirementId);
        if (projectId === undefined || requirement === undefined) {
            clearReviewActionRequirement();
            return;
        }
        setReviewActionRequirement({
            projectId,
            requirementId: requirement.id,
            visibleKey: requirement.visibleKey,
            status: requirement.status,
        });
        void getReviewSummary(projectId, requirementId).then((summary) => {
            if (requirement.status === 'draft' && summary.state !== 'not_started') {
                void navigate(getProjectRequirementReviewRoute(projectId, requirementId));
            }
        });
    }
    function openRequirement(requirement: RequirementTableRow): void {
        if (projectId === undefined) return;
        const detailsRoute = getProjectRequirementDetailsRoute(projectId, requirement.id);
        setSelectedRequirementId(requirement.id);
        openTab({ id: detailsRoute, label: requirement.visibleKey, closable: true });
        void navigate(detailsRoute);
    }
    return { copyRequirementKey, selectRequirement, openRequirement };
}
