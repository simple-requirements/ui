import { useSelector } from "@tanstack/react-store";
import { Navigate, Outlet, useParams } from "react-router";

import { getProjectPermissions } from "@/auth/projectPermissions";
import { getProjectRoute } from "@/router/projectRoutes";
import { authStore } from "@/stores/authStore";

export type ProjectPermission = "read" | "manage_requirements";

export function ProjectPermissionRoute({
  permission,
}: Readonly<{ permission: ProjectPermission }>) {
  const { projectId } = useParams();
  const user = useSelector(authStore, (state) => state.user);

  if (projectId === undefined) return <Navigate to="/" replace />;

  const permissions = getProjectPermissions(user, projectId);
  const allowed =
    permission === "read"
      ? permissions.canReadProject
      : permissions.canManageRequirements;

  if (!allowed) {
    return (
      <Navigate
        to={permission === "read" ? "/" : getProjectRoute(projectId)}
        replace
      />
    );
  }

  return <Outlet />;
}
