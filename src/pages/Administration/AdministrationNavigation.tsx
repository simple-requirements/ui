import { NavLink } from "react-router";

import {
  PROJECT_MEMBERSHIP_ADMINISTRATION_ROUTE,
  USER_ADMINISTRATION_ROUTE,
} from "@/auth/authRoutes";

import "@/pages/Administration/AdministrationNavigation.scss";

function navigationClassName({ isActive }: Readonly<{ isActive: boolean }>) {
  return isActive
    ? "administration-navigation__link administration-navigation__link--active"
    : "administration-navigation__link";
}

export function AdministrationNavigation() {
  return (
    <nav className="administration-navigation" aria-label="Administration sections">
      <NavLink
        end
        className={navigationClassName}
        to={USER_ADMINISTRATION_ROUTE}
      >
        Users and sessions
      </NavLink>
      <NavLink
        end
        className={navigationClassName}
        to={PROJECT_MEMBERSHIP_ADMINISTRATION_ROUTE}
      >
        Project memberships
      </NavLink>
    </nav>
  );
}
