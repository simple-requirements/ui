import { NavLink } from "react-router";

import {
  ADMINISTRATOR_PROJECTS_ROUTE,
  ADMINISTRATOR_USERS_ROUTE,
} from "@/auth/authRoutes";

import "@/components/RootLayout/AdministratorSidebar/AdministratorSidebar.scss";

/**
 * Builds the active-state class name for Administrator navigation links.
 * @param state React Router active-state information.
 * @returns Sidebar link class name with the active modifier when applicable.
 */
function navigationClassName({
  isActive,
}: Readonly<{ isActive: boolean }>): string {
  return isActive
    ? "administrator-sidebar__link administrator-sidebar__link--active"
    : "administrator-sidebar__link";
}

/**
 * Renders the dedicated Administrator workspace navigation.
 * @returns Sidebar containing only Users & Sessions and Projects.
 */
export function AdministratorSidebar() {
  return (
    <aside
      className="administrator-sidebar"
      aria-label="Administrator workspace"
    >
      <div className="administrator-sidebar__header">Administration</div>
      <nav
        className="administrator-sidebar__navigation"
        aria-label="Administrator sections"
      >
        <NavLink
          end
          className={navigationClassName}
          to={ADMINISTRATOR_USERS_ROUTE}
        >
          <span className="pi pi-users" aria-hidden="true" />
          Users &amp; Sessions
        </NavLink>
        <NavLink
          end
          className={navigationClassName}
          to={ADMINISTRATOR_PROJECTS_ROUTE}
        >
          <span className="pi pi-folder" aria-hidden="true" />
          Projects
        </NavLink>
      </nav>
    </aside>
  );
}
