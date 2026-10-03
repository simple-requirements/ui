import { useQuery } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';

import { getRequirementReviewTasksQueryKey, listRequirementReviewTasks } from '@/api/reviewTasksApi';
import { authStore } from '@/stores/authStore';

export type RequirementReviewAssignmentState = Readonly<{
    hasAssignedReviewer: boolean | undefined;
    assignedToCurrentUser: boolean;
}>;

/** Reads the pending review assignment for one requirement and relates it to the signed-in user. */
export function useRequirementReviewAssignment(
    projectId: string | undefined,
    requirementId: string | undefined,
): RequirementReviewAssignmentState {
    const authenticatedUserId = useSelector(authStore, (state) => state.user?.id);
    const tasksQuery = useQuery({
        queryKey: getRequirementReviewTasksQueryKey(projectId, requirementId),
        queryFn: () => {
            if (projectId === undefined || requirementId === undefined) {
                throw new Error('Review-task identifiers are missing.');
            }
            return listRequirementReviewTasks(projectId, requirementId);
        },
        enabled: projectId !== undefined && requirementId !== undefined,
    });
    const pendingTasks = (tasksQuery.data ?? []).filter((task) => task.status === 'pending');

    return {
        hasAssignedReviewer: tasksQuery.isSuccess ? pendingTasks.length > 0 : undefined,
        assignedToCurrentUser:
            authenticatedUserId !== undefined
            && pendingTasks.some((task) => task.assignee.userId === authenticatedUserId),
    };
}
