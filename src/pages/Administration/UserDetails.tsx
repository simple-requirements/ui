import { Button } from "primereact/button";

import type {
  SessionResponse,
  UserAdministrationResponse,
} from "@/api/authApi";
import type { UserStatus } from "@/auth/authTypes";
import { LoadableContent } from "@/components/Feedback/LoadableContent";

export type UserDetailsProps = Readonly<{
  user: UserAdministrationResponse;
  sessions: readonly SessionResponse[];
  sessionsLoading: boolean;
  sessionsError: boolean;
  pending: boolean;
  onChangeStatus: (status: Exclude<UserStatus, "pending">) => void;
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllSessions: () => void;
}>;

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UserDetails({
  user,
  sessions,
  sessionsLoading,
  sessionsError,
  pending,
  onChangeStatus,
  onRevokeSession,
  onRevokeAllSessions,
}: UserDetailsProps) {
  const activeSessions = sessions.filter(
    (session) => session.revokedAt === null,
  );
  const nextStatus = user.status === "active" ? "deactivated" : "active";
  const statusActionLabel =
    user.status === "active" ? "Deactivate account" : "Activate account";
  const activationBlocked =
    user.status !== "active" && user.emailVerifiedAt === null;

  return (
    <section
      className="user-administration__details"
      aria-labelledby="selected-user-title"
    >
      <header>
        <h2 id="selected-user-title">{user.displayName}</h2>
        <p>@{user.username}</p>
      </header>
      <dl className="user-administration__metadata">
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{user.status}</dd>
        </div>
        <div>
          <dt>Email verified</dt>
          <dd>
            {user.emailVerifiedAt === null
              ? "No"
              : formatDateTime(user.emailVerifiedAt)}
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(user.createdAt)}</dd>
        </div>
      </dl>
      <Button
        type="button"
        label={statusActionLabel}
        severity={nextStatus === "deactivated" ? "danger" : undefined}
        disabled={pending || activationBlocked}
        onClick={() => onChangeStatus(nextStatus)}
      />
      {activationBlocked && (
        <p className="user-administration__hint">
          The email address must be verified before activation.
        </p>
      )}

      <div className="user-administration__sessions-header">
        <h3>Sessions</h3>
        <Button
          type="button"
          outlined
          severity="danger"
          label="Revoke all active sessions"
          disabled={pending || activeSessions.length === 0}
          onClick={onRevokeAllSessions}
        />
      </div>
      <LoadableContent
        loading={sessionsLoading}
        error={sessionsError}
        empty={sessions.length === 0}
        loadingMessage="Loading sessions …"
        errorMessage="Sessions could not be loaded."
        emptyMessage="No sessions have been recorded for this user."
      >
        <table className="user-administration__table">
          <caption>Sessions for {user.displayName}</caption>
          <thead>
            <tr>
              <th scope="col">Created</th>
              <th scope="col">Last activity</th>
              <th scope="col">State</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{formatDateTime(session.createdAt)}</td>
                <td>{formatDateTime(session.lastActivityAt)}</td>
                <td>
                  {session.revokedAt === null
                    ? "Active"
                    : `Revoked ${formatDateTime(session.revokedAt)}`}
                </td>
                <td>
                  <Button
                    type="button"
                    text
                    severity="danger"
                    label="Revoke"
                    disabled={pending || session.revokedAt !== null}
                    onClick={() => onRevokeSession(session.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LoadableContent>
    </section>
  );
}
