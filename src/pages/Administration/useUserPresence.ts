import { useQueries } from "@tanstack/react-query";

import {
  listUserSessions,
  type SessionResponse,
  type UserAdministrationResponse,
} from "@/api/authApi";
import { isSessionActive } from "@/pages/Administration/sessionStatus";
import { userSessionsQueryKey } from "@/pages/Administration/useUserAdministration";

export type UserPresence = Readonly<{
  active: boolean;
  activeSessionCount: number;
  loading: boolean;
  error: boolean;
}>;

/** Loads lightweight per-user session state used by the Administrator user table. */
export function useUserPresence(
  users: readonly UserAdministrationResponse[],
): ReadonlyMap<string, UserPresence> {
  const queries = useQueries({
    queries: users.map((user) => ({
      queryKey: userSessionsQueryKey(user.id),
      queryFn: async () => (await listUserSessions(user.id)).data,
    })),
  });

  return new Map(
    users.map((user, index) => {
      const query = queries[index];
      const sessions = (query.data ?? []) as readonly SessionResponse[];
      const activeSessionCount = sessions.filter((session) =>
        isSessionActive(session),
      ).length;

      return [
        user.id,
        {
          active: activeSessionCount > 0,
          activeSessionCount,
          loading: query.isLoading,
          error: query.isError,
        },
      ] as const;
    }),
  );
}
