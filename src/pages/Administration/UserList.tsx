import { Button } from "primereact/button";
import { useState } from "react";
import { Link } from "react-router";

import type { UserAdministrationResponse } from "@/api/authApi";
import type { AccountRole, UserStatus } from "@/auth/authTypes";
import { getAdministratorUserRoute } from "@/auth/authRoutes";
import type { UserPresence } from "@/pages/Administration/useUserPresence";
import {
  accountRoleLabel,
  UserRoleDialog,
} from "@/pages/Administration/UserRoleDialog";
import { formatDateTime } from "@/utils/displayFormatters";

export type UserListProps = Readonly<{
  users: readonly UserAdministrationResponse[];
  presenceByUserId: ReadonlyMap<string, UserPresence>;
  pending: boolean;
  onChangeRole: (user: UserAdministrationResponse, role: AccountRole) => void;
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
  pending,
  onChangeRole,
  onChangeStatus,
  onRevokeAllSessions,
}: UserListProps) {
  const [roleUser, setRoleUser] = useState<UserAdministrationResponse>();

  return (
    <>
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
              const statusDisabled =
                pending || (targetStatus === "active" && !canActivate(user));

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
                      onClick={() => setRoleUser(user)}
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
                          statusDisabled && targetStatus === "active"
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
                        title="Revoke all active sessions"
                        disabled={pending || !loggedIn}
                        onClick={() => onRevokeAllSessions(user.id)}
                      />
                      <Button
                        type="button"
                        text
                        rounded
                        severity="danger"
                        icon="pi pi-trash"
                        aria-label={`Delete ${user.displayName}`}
                        title="User deletion is not permitted; accounts are retained and deactivated."
                        disabled
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <UserRoleDialog
        user={roleUser}
        visible={roleUser !== undefined}
        pending={pending}
        onHide={() => setRoleUser(undefined)}
        onChangeRole={(role) => {
          if (roleUser !== undefined) onChangeRole(roleUser, role);
        }}
      />
    </>
  );
}
