import { useMutation, useQuery } from '@tanstack/react-query';

import {
    listUsers,
    revokeAllUserSessions,
    updateUserRole,
    updateUserStatus,
    type UserAdministrationResponse,
} from '@/api/authApi';
import { queryClient } from '@/api/queryClient';
import type { AccountRole, UserStatus } from '@/auth/authTypes';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import { administrationUsersQueryKey, userSessionsQueryKey } from '@/pages/Administration/administrationQueryKeys';
import { showToastMessage } from '@/stores/toastStore';

type StatusMutationVariables = Readonly<{
    user: UserAdministrationResponse;
    status: Exclude<UserStatus, 'pending'>;
    notify?: boolean;
}>;

/** Loads Administrator user data and exposes account administration mutations. */
export function useUserAdministration() {
    const usersQuery = useQuery({
        queryKey: administrationUsersQueryKey,
        queryFn: async () => (await listUsers()).data,
    });
    const roleMutation = useMutation({
        mutationFn: async ({ user, role }: Readonly<{ user: UserAdministrationResponse; role: AccountRole }>) =>
            (await updateUserRole(user.id, role)).data,
        onSuccess: async (updatedUser) => {
            await queryClient.invalidateQueries({ queryKey: administrationUsersQueryKey });
            showToastMessage({ severity: 'success', summary: 'Account role updated', detail: updatedUser.displayName });
        },
        onError: () => showToastMessage(toastMessages.userAdministrationFailed()),
    });
    const statusMutation = useMutation({
        mutationFn: async ({ user, status }: StatusMutationVariables) => (await updateUserStatus(user.id, status)).data,
        onSuccess: async (updatedUser, variables) => {
            await queryClient.invalidateQueries({ queryKey: administrationUsersQueryKey });
            await queryClient.invalidateQueries({ queryKey: userSessionsQueryKey(updatedUser.id) });
            if (variables.notify !== false) {
                showToastMessage(toastMessages.userStatusChanged(updatedUser.displayName, updatedUser.status));
            }
        },
        onError: () => showToastMessage(toastMessages.userAdministrationFailed()),
    });
    const revokeAllMutation = useMutation({
        mutationFn: (userId: string) => revokeAllUserSessions(userId),
        onSuccess: async (_response, userId) => {
            await queryClient.invalidateQueries({ queryKey: userSessionsQueryKey(userId) });
            showToastMessage(toastMessages.userSessionsRevoked());
        },
        onError: () => showToastMessage(toastMessages.userAdministrationFailed()),
    });

    return {
        users: usersQuery.data ?? [],
        usersLoading: usersQuery.isLoading,
        usersError: usersQuery.isError,
        mutationPending: roleMutation.isPending || statusMutation.isPending || revokeAllMutation.isPending,
        changeRole: roleMutation.mutate,
        changeRoleAsync: roleMutation.mutateAsync,
        changeStatus: statusMutation.mutate,
        changeStatusAsync: statusMutation.mutateAsync,
        revokeAllSessions: revokeAllMutation.mutate,
    };
}
