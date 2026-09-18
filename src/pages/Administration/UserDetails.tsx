import type { UserAdministrationResponse } from "@/api/authApi";
import { accountRoleLabel } from "@/pages/Administration/UserRoleDialog";
import { formatDateTime } from "@/utils/displayFormatters";

export type UserDetailsProps = Readonly<{
  user: UserAdministrationResponse;
  loggedIn: boolean;
  pending: boolean;
  onOpenRoleDialog: (
    user: UserAdministrationResponse,
    loggedIn: boolean,
  ) => void;
}>;

/** Renders administrative account metadata for one user. */
export function UserDetails({
  user,
  loggedIn,
  pending,
  onOpenRoleDialog,
}: UserDetailsProps) {
  return (
    <section
      className="user-administration__details"
      aria-labelledby="selected-user-title"
    >
      <header>
        <h2 id="selected-user-title">{user.displayName}</h2>
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
          <dt>Role</dt>
          <dd>
            <button
              type="button"
              className="user-administration__role-link"
              disabled={pending}
              onClick={() => onOpenRoleDialog(user, loggedIn)}
            >
              {accountRoleLabel(user.role)}
            </button>
          </dd>
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
    </section>
  );
}
