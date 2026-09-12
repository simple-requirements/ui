import { useMutation, useQuery } from '@tanstack/react-query';

import {
    getAuthenticatedUser,
    listProjectMemberships,
    listUsers,
    removeProjectMembership,
    setProjectMembership,
    type ProjectMembershipResponse,
} from '@/api/authApi';
import { listProjectsRequest } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';
import type { ProjectRole } from '@/auth/authTypes';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import {
    administrationProjectsQueryKey,
    administrationUsersQueryKey,
    projectMembershipsQueryKey,
} from '@/pages/Administration/administrationQueryKeys';
import { showToastMessage } from '@/stores/toastStore';
import { authStore, setAuthenticatedSession } from '@/stores/authStore';

type SetMembershipVariables = Readonly<{
    projectId: string;
    userId: string;
    displayName: string;
    roles: readonly ProjectRole[];
}>;

type RemoveMembershipVariables = Readonly<{ projectId: string; userId: string; displayName: string }>;

async function refreshCurrentUserMemberships(userId: string): Promise<void> {
    const state = authStore.state;
    if (state.status !== 'authenticated' || state.user.id !== userId) return;

    const response = await getAuthenticatedUser();
    setAuthenticatedSession({ accessToken: state.accessToken, user: response.data });
}

export function useProjectMembershipAdministration(selectedProjectId: string | undefined) {
    const projectsQuery = useQuery({ queryKey: administrationProjectsQueryKey, queryFn: listProjectsRequest });
    const usersQuery = useQuery({
        queryKey: administrationUsersQueryKey,
        queryFn: async () => (await listUsers()).data,
        enabled: selectedProjectId !== undefined,
    });
    const membershipsQuery = useQuery({
        queryKey: projectMembershipsQueryKey(selectedProjectId),
        queryFn: async () => {
            if (selectedProjectId === undefined) {
                return [];
            }

            return (await listProjectMemberships(selectedProjectId)).data;
        },
        enabled: selectedProjectId !== undefined,
    });
    const setMembershipMutation = useMutation({
        mutationFn: async ({ projectId, userId, roles }: SetMembershipVariables) =>
            (await setProjectMembership(projectId, userId, roles)).data,
        onSuccess: async (membership, variables) => {
            queryClient.setQueryData<ProjectMembershipResponse[]>(
                projectMembershipsQueryKey(variables.projectId),
                (currentMemberships = []) => {
                    const withoutUpdatedUser = currentMemberships.filter(
                        (currentMembership) => currentMembership.userId !== membership.userId,
                    );

                    return [...withoutUpdatedUser, membership];
                },
            );
            await queryClient.invalidateQueries({ queryKey: projectMembershipsQueryKey(variables.projectId) });
            await refreshCurrentUserMemberships(variables.userId);
            showToastMessage(toastMessages.projectMembershipSaved(membership.displayName));
        },
        onError: () => showToastMessage(toastMessages.projectMembershipAdministrationFailed()),
    });
    const removeMembershipMutation = useMutation({
        mutationFn: ({ projectId, userId }: RemoveMembershipVariables) => removeProjectMembership(projectId, userId),
        onSuccess: async (_response, variables) => {
            queryClient.setQueryData<ProjectMembershipResponse[]>(
                projectMembershipsQueryKey(variables.projectId),
                (currentMemberships = []) =>
                    currentMemberships.filter((membership) => membership.userId !== variables.userId),
            );
            await queryClient.invalidateQueries({ queryKey: projectMembershipsQueryKey(variables.projectId) });
            await refreshCurrentUserMemberships(variables.userId);
            showToastMessage(toastMessages.projectMembershipRemoved(variables.displayName));
        },
        onError: () => showToastMessage(toastMessages.projectMembershipAdministrationFailed()),
    });

    return {
        projects: projectsQuery.data ?? [],
        projectsLoading: projectsQuery.isLoading,
        projectsError: projectsQuery.isError,
        users: usersQuery.data ?? [],
        usersLoading: usersQuery.isLoading,
        usersError: usersQuery.isError,
        memberships: membershipsQuery.data ?? [],
        membershipsLoading: membershipsQuery.isLoading,
        membershipsError: membershipsQuery.isError,
        mutationPending: setMembershipMutation.isPending || removeMembershipMutation.isPending,
        setMembership: setMembershipMutation.mutate,
        removeMembership: removeMembershipMutation.mutate,
    };
}
