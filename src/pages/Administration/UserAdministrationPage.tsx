import { useState } from "react";

import { LoadableContent } from "@/components/Feedback/LoadableContent";
import { UserDetails } from "@/pages/Administration/UserDetails";
import { UserList } from "@/pages/Administration/UserList";
import { useUserAdministration } from "@/pages/Administration/useUserAdministration";

import "@/pages/Administration/UserAdministrationPage.scss";

/**
 * Renders user, role, account-status, and session administration in the Administrator workspace.
 * @returns User and session administration page.
 */
export function UserAdministrationPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const administration = useUserAdministration(selectedUserId);
  const selectedUser = administration.users.find(
    (user) => user.id === selectedUserId,
  );

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
        <div className="user-administration__layout">
          <UserList
            users={administration.users}
            selectedUserId={selectedUserId}
            onSelect={setSelectedUserId}
          />
          {selectedUser === undefined ? (
            <p className="user-administration__selection">
              Select a user to manage the account and sessions.
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
        </div>
      </LoadableContent>
    </section>
  );
}
