import { Button } from "primereact/button";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";

import type {
  ProjectMembershipResponse,
  UserAdministrationResponse,
} from "@/api/authApi";
import type { ProjectRole } from "@/auth/authTypes";

const projectRoleOptions: readonly Readonly<{
  value: ProjectRole;
  label: string;
}>[] = [
  { value: "requirements_engineer", label: "Requirements Engineer" },
  { value: "developer", label: "Developer" },
  { value: "viewer", label: "Viewer" },
];

function normalizeRoles(roles: readonly ProjectRole[]): ProjectRole[] {
  return projectRoleOptions
    .filter((option) => roles.includes(option.value))
    .map((option) => option.value);
}

function sameRoles(
  left: readonly ProjectRole[],
  right: readonly ProjectRole[],
): boolean {
  const normalizedLeft = normalizeRoles(left);
  const normalizedRight = normalizeRoles(right);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((role, index) => role === normalizedRight[index])
  );
}

function roleSummary(roles: readonly ProjectRole[]): string {
  return projectRoleOptions
    .filter((option) => roles.includes(option.value))
    .map((option) => option.label)
    .join(", ");
}

function rolesFromAssignmentForm(form: HTMLFormElement): ProjectRole[] {
  const values = new FormData(form).getAll("roles");

  return normalizeRoles(
    values.filter((value): value is ProjectRole =>
      projectRoleOptions.some((option) => option.value === value),
    ),
  );
}

type RoleSelectionProps = Readonly<{
  legend: string;
  roles: readonly ProjectRole[];
  disabled: boolean;
  onChange: (roles: ProjectRole[]) => void;
}>;

function RoleSelection({
  legend,
  roles,
  disabled,
  onChange,
}: RoleSelectionProps) {
  const id = useId();

  function toggleRole(role: ProjectRole): void {
    const nextRoles = roles.includes(role)
      ? roles.filter((candidate) => candidate !== role)
      : [...roles, role];
    onChange(normalizeRoles(nextRoles));
  }

  return (
    <fieldset className="project-memberships__roles" disabled={disabled}>
      <legend>{legend}</legend>
      {projectRoleOptions.map((option) => {
        const inputId = `${id}-${option.value}`;

        return (
          <label key={option.value} htmlFor={inputId}>
            <input
              id={inputId}
              type="checkbox"
              value={option.value}
              checked={roles.includes(option.value)}
              onChange={() => toggleRole(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </fieldset>
  );
}

type AssignmentRoleSelectionProps = Readonly<{
  disabled: boolean;
}>;

function AssignmentRoleSelection({ disabled }: AssignmentRoleSelectionProps) {
  const id = useId();

  return (
    <fieldset className="project-memberships__roles" disabled={disabled}>
      <legend>Roles for new membership</legend>
      {projectRoleOptions.map((option) => {
        const inputId = `${id}-${option.value}`;

        return (
          <label key={option.value} htmlFor={inputId}>
            <input
              id={inputId}
              name="roles"
              type="checkbox"
              value={option.value}
            />
            {option.label}
          </label>
        );
      })}
    </fieldset>
  );
}

type MembershipRowProps = Readonly<{
  membership: ProjectMembershipResponse;
  user: UserAdministrationResponse | undefined;
  pending: boolean;
  onSetMembership: (
    userId: string,
    displayName: string,
    roles: readonly ProjectRole[],
  ) => void;
  onRemoveMembership: (userId: string, displayName: string) => void;
}>;

function MembershipRow({
  membership,
  user,
  pending,
  onSetMembership,
  onRemoveMembership,
}: MembershipRowProps) {
  const [roles, setRoles] = useState<ProjectRole[]>(() =>
    normalizeRoles(membership.roles),
  );

  useEffect(() => {
    setRoles(normalizeRoles(membership.roles));
  }, [membership.roles]);

  const dirty = !sameRoles(roles, membership.roles);
  const isAdministrator = user?.globalRoles.includes("administrator") ?? false;

  return (
    <tr>
      <th scope="row">
        {membership.displayName}
        <small>@{membership.username}</small>
        {isAdministrator && <small>Administrator</small>}
      </th>
      <td>{roleSummary(membership.roles)}</td>
      <td>
        <RoleSelection
          legend={`Roles for ${membership.displayName}`}
          roles={roles}
          disabled={pending}
          onChange={setRoles}
        />
      </td>
      <td className="project-memberships__actions">
        <Button
          type="button"
          label="Save roles"
          disabled={pending || roles.length === 0 || !dirty}
          onClick={() =>
            onSetMembership(
              membership.userId,
              membership.displayName,
              roles,
            )
          }
        />
        <Button
          type="button"
          outlined
          severity="danger"
          label="Remove membership"
          disabled={pending}
          onClick={() =>
            onRemoveMembership(membership.userId, membership.displayName)
          }
        />
      </td>
    </tr>
  );
}

export type ProjectMembershipsProps = Readonly<{
  projectName: string;
  users: readonly UserAdministrationResponse[];
  memberships: readonly ProjectMembershipResponse[];
  pending: boolean;
  onSetMembership: (
    userId: string,
    displayName: string,
    roles: readonly ProjectRole[],
  ) => void;
  onRemoveMembership: (userId: string, displayName: string) => void;
}>;

export function ProjectMemberships({
  projectName,
  users,
  memberships,
  pending,
  onSetMembership,
  onRemoveMembership,
}: ProjectMembershipsProps) {
  const userSelectId = useId();
  const memberUserIds = useMemo(
    () => new Set(memberships.map((membership) => membership.userId)),
    [memberships],
  );
  const availableUsers = useMemo(
    () => users.filter((user) => !memberUserIds.has(user.id)),
    [memberUserIds, users],
  );

  function addMembership(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const userId = formData.get("userId");
    const user =
      typeof userId === "string"
        ? users.find((candidate) => candidate.id === userId)
        : undefined;
    const roles = rolesFromAssignmentForm(form);

    if (user === undefined || roles.length === 0) {
      return;
    }

    onSetMembership(user.id, user.displayName, roles);
    form.reset();
  }

  return (
    <section
      className="project-memberships"
      aria-labelledby="project-memberships-title"
    >
      <header>
        <h2 id="project-memberships-title">{projectName}</h2>
        <p>
          Assign one or more project roles. Administrators do not need a
          membership for global read or administration, but project mutations
          require a project role.
        </p>
      </header>

      <form
        className="project-memberships__assignment"
        aria-label="Assign project membership"
        onSubmit={addMembership}
      >
        <div className="project-memberships__user-select">
          <label htmlFor={userSelectId}>User</label>
          <select
            id={userSelectId}
            name="userId"
            defaultValue=""
            disabled={pending || availableUsers.length === 0}
          >
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} (@{user.username}) — {user.status}
                {user.globalRoles.includes("administrator")
                  ? " — Administrator"
                  : ""}
              </option>
            ))}
          </select>
        </div>
        <AssignmentRoleSelection
          disabled={pending || availableUsers.length === 0}
        />
        <button
          type="submit"
          className="p-button p-component"
          disabled={pending || availableUsers.length === 0}
        >
          <span className="p-button-label">Add membership</span>
        </button>
        {availableUsers.length === 0 && (
          <p className="project-memberships__hint">
            {users.length === 0
              ? "No registered users are available."
              : "Every registered user already has a membership in this project."}
          </p>
        )}
      </form>

      {memberships.length === 0 ? (
        <p className="project-memberships__empty">
          This project has no memberships yet.
        </p>
      ) : (
        <table className="project-memberships__table">
          <caption>Memberships for {projectName}</caption>
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Current roles</th>
              <th scope="col">Change roles</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <MembershipRow
                key={membership.userId}
                membership={membership}
                user={users.find((user) => user.id === membership.userId)}
                pending={pending}
                onSetMembership={onSetMembership}
                onRemoveMembership={onRemoveMembership}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
