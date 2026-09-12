import { useSelector } from "@tanstack/react-store";
import { Navigate, Outlet, useParams } from "react-router";

import {
  hasProjectPermission,
  getProjectPermissions,
  type ProjectPermission,
  projectPermissionKinds,
} from "@/auth/projectPermissions";
import { getProjectRoute } from "@/router/projectRoutes";
import { authStore } from "@/stores/authStore";

function deniedRedirectTarget(
  projectId: string,
  permission: ProjectPermission,
): string {
  return permission === projectPermissionKinds.read ? "/" : getProjectRoute(projectId);
}

export function ProjectPermissionRoute({
  permission,
}: Readonly<{ permission: ProjectPermission }>) {
  const { projectId } = useParams();
  const user = useSelector(authStore, (state) => state.user);

  if (projectId === undefined) return <Navigate to="/" replace />;

  const permissions = getProjectPermissions(user, projectId);

  if (!hasProjectPermission(permissions, permission)) {
    return <Navigate to={deniedRedirectTarget(projectId, permission)} replace />;
  }

  return <Outlet />;
}
