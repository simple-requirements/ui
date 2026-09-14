import { useSelector } from "@tanstack/react-store";
import { Navigate } from "react-router";

import { ADMINISTRATOR_USERS_ROUTE } from "@/auth/authRoutes";
import { isAdministrator } from "@/auth/globalPermissions";
import { authStore } from "@/stores/authStore";

/**
 * Renders the project workspace entry or redirects Administrators to their dedicated workspace.
 * @returns Administrator redirect or the project-workspace landing content.
 */
export function WorkspacePage() {
  const user = useSelector(authStore, (state) => state.user);

  if (isAdministrator(user)) {
    return <Navigate to={ADMINISTRATOR_USERS_ROUTE} replace />;
  }

  return (
    <div className="root-layout__content-placeholder">
      <h1 className="root-layout__content-title">Workspace</h1>
      <p className="root-layout__content-text">
        Placeholder content area. Project and requirement views will be rendered
        here later.
      </p>
    </div>
  );
}
