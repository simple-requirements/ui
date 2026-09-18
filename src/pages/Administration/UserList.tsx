import { Button } from "primereact/button";
import { Link } from "react-router";

import type { UserAdministrationResponse } from "@/api/authApi";
import type { UserStatus } from "@/auth/authTypes";
import { getAdministratorUserRoute } from "@/auth/authRoutes";
import { accountRoleLabel } from "@/pages/Administration/UserRoleDialog";
import type { UserPresence } from "@/pages/Administration/useUserPresence";
import { formatDateTime } from "@/utils/displayFormatters";

export type UserListProps = Readonly<{
  users: readonly UserAdministrationResponse[];
  presenceByUserId: ReadonlyMap<string, UserPresence>;
  currentUserId: string | undefined;
  pending: boolean;
  onOpenRoleDialog: (
    user: UserAdministrationResponse,
    loggedIn: boolean,
  ) => void;
  onChangeStatus: (
    user: UserAdministrationResponse,
    status: Exclude<UserStatus, "pending">,
  ) => void;
  onRevokeAllSessions: (userId: string) => void;
}>;

function statusLabel(status: UserStatus): string {
  switch (status) {
    case "active":
      return "Login enabled";
    case "deactivated":
      return "Deactivated";
    case "pending":
      return "Pending activation";
  }
}

function canActivate(user: UserAdministrationResponse): boolean {
  return user.emailVerifiedAt !== null && user.role !== null;
}

export function UserList({
  users,
  presenceByUserId,
  currentUserId,
  pending,
  onOpenRoleDialog,
  onChangeStatus,
  onRevokeAllSessions,
}: UserListProps) {
  return (
    <div className="user-administration__table-wrapper">
      <table className="user-administration__table">
        <caption>Registered users</caption>
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Status</th>
            <th scope="col">Role</th>
            <th scope="col">Created at</th>
            <th scope="col">Email verified at</th>
            <th scope="col">Is active</th>
            <th scope="col" className="user-administration__actions-column">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const presence = presenceByUserId.get(user.id);
            const loggedIn = presence?.active ?? false;
            const targetStatus =
              user.status === "active" ? "deactivated" : "active";
            const isCurrentUser = user.id === currentUserId;
            const statusDisabled =
              pending ||
              (targetStatus === "active" && !canActivate(user)) ||
              (targetStatus === "deactivated" && isCurrentUser);

            return (
              <tr key={user.id}>
                <th scope="row">
                  <Link
                    className="user-administration__user-link"
                    to={getAdministratorUserRoute(user.id)}
                  >
                    {user.displayName}
                    <small>@{user.username}</small>
                  </Link>
                </th>
                <td>{statusLabel(user.status)}</td>
                <td>
                  <button
                    type="button"
                    className="user-administration__role-link"
                    disabled={
                      pending ||
                      presence?.loading === true ||
                      presence?.error === true
                    }
                    title={
                      presence?.loading === true
                        ? "Checking whether this user is logged in."
                        : presence?.error === true
                          ? "The login state could not be determined."
                          : undefined
                    }
                    onClick={() => onOpenRoleDialog(user, loggedIn)}
                  >
                    {accountRoleLabel(user.role)}
                  </button>
                </td>
                <td>{formatDateTime(user.createdAt)}</td>
                <td>
                  {user.emailVerifiedAt === null
                    ? "Not verified"
                    : formatDateTime(user.emailVerifiedAt)}
                </td>
                <td>
                  <span
                    className="user-administration__presence"
                    aria-label={
                      presence?.loading
                        ? "Login state loading"
                        : presence?.error
                          ? "Login state unavailable"
                          : loggedIn
                            ? "Logged in"
                            : "Not logged in"
                    }
                    title={
                      loggedIn
                        ? `${String(presence?.activeSessionCount ?? 1)} active session(s)`
                        : "No active session"
                    }
                  >
                    <i
                      className={`pi ${loggedIn ? "pi-sign-in" : "pi-sign-out"}`}
                      aria-hidden="true"
                    />
                  </span>
                </td>
                <td>
                  <div className="user-administration__row-actions">
                    <Button
                      type="button"
                      text
                      rounded
                      severity={
                        targetStatus === "deactivated" ? "danger" : undefined
                      }
                      icon={
                        targetStatus === "deactivated"
                          ? "pi pi-ban"
                          : "pi pi-check-circle"
                      }
                      aria-label={
                        targetStatus === "deactivated"
                          ? `Deactivate ${user.displayName}`
                          : `Activate ${user.displayName}`
                      }
                      title={
                        isCurrentUser && targetStatus === "deactivated"
                          ? "You cannot deactivate your own Administrator account."
                          : statusDisabled && targetStatus === "active"
                            ? "Verify the email and assign a role before activation."
                            : undefined
                      }
                      disabled={statusDisabled}
                      onClick={() => onChangeStatus(user, targetStatus)}
                    />
                    <Button
                      type="button"
                      text
                      rounded
                      icon="pi pi-sign-out"
                      aria-label={`Log out ${user.displayName}`}
                      title={
                        isCurrentUser
                          ? "Use Logout in the account menu to end your own session."
                          : "Revoke all active sessions"
                      }
                      disabled={pending || !loggedIn || isCurrentUser}
                      onClick={() => onRevokeAllSessions(user.id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
