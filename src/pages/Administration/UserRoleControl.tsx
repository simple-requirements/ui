import type { UserAdministrationResponse } from "@/api/authApi";
import type { AccountRole } from "@/auth/authTypes";

const accountRoleOptions: Readonly<{ label: string; value: AccountRole }>[] = [
  { label: "Administrator", value: "administrator" },
  { label: "Requirements Engineer", value: "requirements_engineer" },
  { label: "Developer", value: "developer" },
  { label: "Viewer", value: "viewer" },
];

export type UserRoleControlProps = Readonly<{
  user: UserAdministrationResponse;
  pending: boolean;
  onChangeRole: (role: AccountRole) => void;
}>;

/**
 * Renders account-role assignment while respecting backend role immutability rules.
 * @param props Selected account, mutation state, and role-change callback.
 * @returns Account role selector.
 */
export function UserRoleControl({
  user,
  pending,
  onChangeRole,
}: UserRoleControlProps) {
  const roleLocked = user.status === "active";

  return (
    <label
      className="user-administration__role-field"
      htmlFor="user-account-role"
    >
      Account role
      <select
        id="user-account-role"
        value={user.role ?? ""}
        disabled={pending || roleLocked}
        onChange={(event) => onChangeRole(event.target.value as AccountRole)}
      >
        <option value="" disabled>
          Select a role
        </option>
        {accountRoleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
