import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";

import type { UserAdministrationResponse } from "@/api/authApi";
import type { AccountRole } from "@/auth/authTypes";

import "@/pages/Administration/UserRoleDialog.scss";

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
  onChangeRole: (role: AccountRole) => void | Promise<void>;
}>;

/** Renders role selection for the temporarily deactivated account. */
export function UserRoleDialog({
  user,
  visible,
  pending,
  onHide,
  onChangeRole,
}: UserRoleDialogProps) {
  const [role, setRole] = useState<AccountRole | "">(user?.role ?? "");

  useEffect(() => {
    setRole(user?.role ?? "");
  }, [user?.id, user?.role]);

  async function submit(): Promise<void> {
    if (role === "" || user === undefined || role === user.role) return;
    await onChangeRole(role);
  }

  return (
    <Dialog
      visible={visible}
      modal
      dismissableMask={false}
      closable={!pending}
      closeOnEscape={!pending}
      draggable={false}
      resizable={false}
      header={
        <h2 className="user-role-dialog__heading">
          {user === undefined
            ? "Account role"
            : `Account role — ${user.displayName}`}
        </h2>
      }
      pt={{
        root: { className: "user-role-dialog" },
        header: { className: "user-role-dialog__header" },
        content: { className: "user-role-dialog__content" },
      }}
      onHide={onHide}
    >
      {user !== undefined && (
        <form
          className="user-role-dialog__form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="user-role-dialog__field">
            <label
              className="user-role-dialog__label"
              htmlFor="administrator-user-role"
            >
              Role
            </label>
            <select
              className="user-role-dialog__select"
              id="administrator-user-role"
              value={role}
              disabled={pending}
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
          </div>
          <p className="user-role-dialog__message">
            The account is temporarily deactivated while this dialog is open and
            will be reactivated when the dialog closes.
          </p>
          <div className="user-role-dialog__actions">
            <Button
              type="button"
              outlined
              label="Cancel"
              disabled={pending}
              pt={{
                root: {
                  className:
                    "user-role-dialog__button user-role-dialog__button--cancel",
                },
              }}
              onClick={onHide}
            />
            <Button
              type="submit"
              label="Save role"
              disabled={pending || role === "" || role === user.role}
              pt={{
                root: {
                  className:
                    "user-role-dialog__button user-role-dialog__button--save",
                },
              }}
            />
          </div>
        </form>
      )}
    </Dialog>
  );
}
