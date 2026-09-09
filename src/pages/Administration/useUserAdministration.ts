import { useMutation, useQuery } from "@tanstack/react-query";

import {
  listUsers,
  listUserSessions,
  revokeAllUserSessions,
  revokeUserSession,
  updateUserStatus,
  type UserAdministrationResponse,
} from "@/api/authApi";
import { queryClient } from "@/api/queryClient";
import type { UserStatus } from "@/auth/authTypes";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import { administrationUsersQueryKey } from "@/pages/Administration/administrationQueryKeys";
import { showToastMessage } from "@/stores/toastStore";

function userSessionsQueryKey(userId: string | undefined) {
  return ["administration", "users", userId, "sessions"] as const;
}

export function useUserAdministration(selectedUserId: string | undefined) {
  const usersQuery = useQuery({
    queryKey: administrationUsersQueryKey,
    queryFn: async () => (await listUsers()).data,
  });
  const sessionsQuery = useQuery({
    queryKey: userSessionsQueryKey(selectedUserId),
    queryFn: async () => {
      if (selectedUserId === undefined) {
        return [];
      }

      return (await listUserSessions(selectedUserId)).data;
    },
    enabled: selectedUserId !== undefined,
  });
  const statusMutation = useMutation({
    mutationFn: async ({
      user,
      status,
    }: Readonly<{
      user: UserAdministrationResponse;
      status: Exclude<UserStatus, "pending">;
    }>) => (await updateUserStatus(user.id, status)).data,
    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({
        queryKey: administrationUsersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: userSessionsQueryKey(updatedUser.id),
      });
      showToastMessage(
        toastMessages.userStatusChanged(
          updatedUser.displayName,
          updatedUser.status,
        ),
      );
    },
    onError: () => showToastMessage(toastMessages.userAdministrationFailed()),
  });
  const revokeSessionMutation = useMutation({
    mutationFn: ({
      userId,
      sessionId,
    }: Readonly<{ userId: string; sessionId: string }>) =>
      revokeUserSession(userId, sessionId),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: userSessionsQueryKey(variables.userId),
      });
      showToastMessage(toastMessages.userSessionRevoked());
    },
    onError: () => showToastMessage(toastMessages.userAdministrationFailed()),
  });
  const revokeAllMutation = useMutation({
    mutationFn: (userId: string) => revokeAllUserSessions(userId),
    onSuccess: async (_response, userId) => {
      await queryClient.invalidateQueries({
        queryKey: userSessionsQueryKey(userId),
      });
      showToastMessage(toastMessages.userSessionsRevoked());
    },
    onError: () => showToastMessage(toastMessages.userAdministrationFailed()),
  });

  return {
    users: usersQuery.data ?? [],
    usersLoading: usersQuery.isLoading,
    usersError: usersQuery.isError,
    sessions: sessionsQuery.data ?? [],
    sessionsLoading: sessionsQuery.isLoading,
    sessionsError: sessionsQuery.isError,
    mutationPending:
      statusMutation.isPending ||
      revokeSessionMutation.isPending ||
      revokeAllMutation.isPending,
    changeStatus: statusMutation.mutate,
    revokeSession: revokeSessionMutation.mutate,
    revokeAllSessions: revokeAllMutation.mutate,
  };
}
