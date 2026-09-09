import { useSelector } from "@tanstack/react-store";
import { Navigate, Outlet } from "react-router";

import { authStore } from "@/stores/authStore";

export function AdministratorRoute() {
  const user = useSelector(authStore, (state) => state.user);
  const isAdministrator = user?.globalRoles.includes("administrator") ?? false;

  return isAdministrator ? <Outlet /> : <Navigate to="/" replace />;
}
