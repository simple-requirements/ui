import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";

import type { UserAdministrationResponse } from "@/api/authApi";
import type { AccountRole } from "@/auth/authTypes";

const roleOptions: Readonly<{ label: string; value: AccountRole }>[] = [
  { label: "Administrator", value: "administrator" },
  { label: "Requirements Engineer", value: "requirements_engineer" },
  { label: "Developer", value: "developer" },
  { label: "Viewer", value: "viewer" },
];

export function accountRoleLabel(role: AccountRole | null): string {
  return (
    roleOptions.find((option) => option.value === role)?.label ?? "Not assigned"
  );
}

export type UserRoleDialogProps = Readonly<{
  user: UserAdministrationResponse | undefined;
  visible: boolean;
  pending: boolean;
  onHide: () => void;
  onChangeRole: (role: AccountRole) => void;
}>;

/** Shows role assignment in a compact dialog while respecting backend role-lock rules. */
export function UserRoleDialog({
  user,
  visible,
  pending,
  onHide,
  onChangeRole,
}: UserRoleDialogProps) {
  const [role, setRole] = useState<AccountRole | "">(user?.role ?? "");
  const roleLocked = user?.status === "active";

  useEffect(() => {
    setRole(user?.role ?? "");
  }, [user?.id, user?.role]);

  function submit(): void {
    if (role === "" || user === undefined || roleLocked) return;
    onChangeRole(role);
    onHide();
  }

  return (
    <Dialog
      visible={visible}
      modal
      header={
        user === undefined
          ? "Account role"
          : `Account role — ${user.displayName}`
      }
      onHide={onHide}
    >
      {user !== undefined && (
        <div className="user-administration__role-dialog">
          <label htmlFor="administrator-user-role">Role</label>
          <select
            id="administrator-user-role"
            value={role}
            disabled={pending || roleLocked}
            onChange={(event) =>
              setRole(event.currentTarget.value as AccountRole)
            }
          >
            <option value="" disabled>
              Select a role
            </option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {roleLocked && (
            <p className="user-administration__hint">
              Deactivate this account before changing its role. Deactivation
              revokes active sessions.
            </p>
          )}
          <div className="user-administration__dialog-actions">
            <Button type="button" label="Cancel" outlined onClick={onHide} />
            <Button
              type="button"
              label="Save role"
              disabled={
                pending || roleLocked || role === "" || role === user.role
              }
              onClick={submit}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
