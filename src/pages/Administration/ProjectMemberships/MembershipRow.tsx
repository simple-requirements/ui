import { Button } from "primereact/button";
import { useEffect, useState } from "react";

import type {
  ProjectMembershipResponse,
  UserAdministrationResponse,
} from "@/api/authApi";
import type { ProjectRole } from "@/auth/authTypes";
import {
  normalizeProjectRoles,
  projectRoleSummary,
  sameProjectRoles,
} from "@/auth/projectRoleMetadata";

import { RoleSelection } from "@/pages/Administration/ProjectMemberships/RoleSelection";
import type {
  RemoveProjectMembershipHandler,
  SetProjectMembershipHandler,
} from "@/pages/Administration/ProjectMemberships/types";

type MembershipRowProps = Readonly<{
  membership: ProjectMembershipResponse;
  user: UserAdministrationResponse | undefined;
  pending: boolean;
  onSetMembership: SetProjectMembershipHandler;
  onRemoveMembership: RemoveProjectMembershipHandler;
}>;

export function MembershipRow({
  membership,
  user,
  pending,
  onSetMembership,
  onRemoveMembership,
}: MembershipRowProps) {
  const [roles, setRoles] = useState<ProjectRole[]>(() =>
    normalizeProjectRoles(membership.roles),
  );

  useEffect(() => {
    setRoles(normalizeProjectRoles(membership.roles));
  }, [membership.roles]);

  const dirty = !sameProjectRoles(roles, membership.roles);
  const isAdministrator = user?.globalRoles.includes("administrator") ?? false;

  return (
    <tr>
      <th scope="row">
        {membership.displayName}
        <small>@{membership.username}</small>
        {isAdministrator && <small>Administrator</small>}
      </th>
      <td>{projectRoleSummary(membership.roles)}</td>
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
            onSetMembership(membership.userId, membership.displayName, roles)
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
