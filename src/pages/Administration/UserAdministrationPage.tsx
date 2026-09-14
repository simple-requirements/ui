import { useParams } from "react-router";

import { LoadableContent } from "@/components/Feedback/LoadableContent";
import { UserDetails } from "@/pages/Administration/UserDetails";
import { UserList } from "@/pages/Administration/UserList";
import { useUserAdministration } from "@/pages/Administration/useUserAdministration";
import { useUserPresence } from "@/pages/Administration/useUserPresence";

import "@/pages/Administration/UserAdministrationPage.scss";

/** Renders the Administrator user overview or one selected user's account/session details. */
export function UserAdministrationPage() {
  const { userId } = useParams<{ userId?: string }>();
  const administration = useUserAdministration(userId);
  const presenceByUserId = useUserPresence(administration.users);
  const selectedUser = administration.users.find((user) => user.id === userId);

  return (
    <section
      className="user-administration"
      aria-labelledby="user-administration-title"
    >
      <header>
        <p className="user-administration__eyebrow">Administration</p>
        <h1 id="user-administration-title">Users &amp; Sessions</h1>
      </header>

      <LoadableContent
        loading={administration.usersLoading}
        error={administration.usersError}
        empty={administration.users.length === 0}
        loadingMessage="Loading users …"
        errorMessage="Users could not be loaded."
        emptyMessage="No users are available."
      >
        {userId === undefined ? (
          <UserList
            users={administration.users}
            presenceByUserId={presenceByUserId}
            pending={administration.mutationPending}
            onChangeRole={(user, role) =>
              administration.changeRole({ user, role })
            }
            onChangeStatus={(user, status) =>
              administration.changeStatus({ user, status })
            }
            onRevokeAllSessions={administration.revokeAllSessions}
          />
        ) : selectedUser === undefined ? (
          <p role="alert" className="user-administration__selection">
            The selected user could not be found.
          </p>
        ) : (
          <UserDetails
            user={selectedUser}
            sessions={administration.sessions}
            sessionsLoading={administration.sessionsLoading}
            sessionsError={administration.sessionsError}
            pending={administration.mutationPending}
            onChangeRole={(role) =>
              administration.changeRole({ user: selectedUser, role })
            }
            onChangeStatus={(status) =>
              administration.changeStatus({ user: selectedUser, status })
            }
            onRevokeSession={(sessionId) =>
              administration.revokeSession({
                userId: selectedUser.id,
                sessionId,
              })
            }
            onRevokeAllSessions={() =>
              administration.revokeAllSessions(selectedUser.id)
            }
          />
        )}
      </LoadableContent>
    </section>
  );
}
