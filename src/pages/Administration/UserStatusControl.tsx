import { Button } from "primereact/button";

import type { UserAdministrationResponse } from "@/api/authApi";
import type { UserStatus } from "@/auth/authTypes";

export type UserStatusControlProps = Readonly<{
  user: UserAdministrationResponse;
  pending: boolean;
  onChangeStatus: (status: Exclude<UserStatus, "pending">) => void;
}>;

/**
 * Resolves the account status reached by the status action.
 * @param status Current account status.
 * @returns The active or deactivated target status.
 */
function getNextStatus(status: UserStatus): Exclude<UserStatus, "pending"> {
  return status === "active" ? "deactivated" : "active";
}

/**
 * Resolves guidance that explains why account activation is unavailable.
 * @param user User account being administered.
 * @returns Activation guidance messages.
 */
function getActivationHints(user: UserAdministrationResponse): string[] {
  if (user.status === "active") {
    return [];
  }

  const hints: string[] = [];
  if (user.emailVerifiedAt === null) {
    hints.push("The email address must be verified before activation.");
  }
  if (user.role === null) {
    hints.push("An account role must be assigned before activation.");
  }
  return hints;
}

/**
 * Renders activation and deactivation controls for one user account.
 * @param props User state and status-change callback.
 * @returns Account status control and activation guidance.
 */
export function UserStatusControl({
  user,
  pending,
  onChangeStatus,
}: UserStatusControlProps) {
  const nextStatus = getNextStatus(user.status);
  const activationHints = getActivationHints(user);

  return (
    <>
      <Button
        type="button"
        label={
          nextStatus === "deactivated"
            ? "Deactivate account"
            : "Activate account"
        }
        severity={nextStatus === "deactivated" ? "danger" : undefined}
        disabled={pending || activationHints.length > 0}
        onClick={() => onChangeStatus(nextStatus)}
      />
      {activationHints.map((hint) => (
        <p className="user-administration__hint" key={hint}>
          {hint}
        </p>
      ))}
    </>
  );
}
