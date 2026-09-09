import { useSelector } from "@tanstack/react-store";
import { Button } from "primereact/button";
import { useState } from "react";
import { useNavigate } from "react-router";

import { logout } from "@/api/authApi";
import { clearUserScopedState } from "@/auth/authenticationFailure";
import { LOGIN_ROUTE, USER_ADMINISTRATION_ROUTE } from "@/auth/authRoutes";
import { authStore } from "@/stores/authStore";

import "@/components/RootLayout/AccountMenu/AccountMenu.scss";

export function AccountMenu() {
  const user = useSelector(authStore, (state) => state.user);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  async function handleLogout(): Promise<void> {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      await logout();
    } catch {
      // Local logout must still complete when the session already expired or the API is unavailable.
    } finally {
      clearUserScopedState();
      void navigate(LOGIN_ROUTE, { replace: true });
    }
  }

  if (user === undefined) {
    return null;
  }

  return (
    <div className="account-menu" aria-label="Current user">
      <span className="account-menu__identity">
        <strong>{user.displayName}</strong>
        <small>@{user.username}</small>
      </span>
      {user.globalRoles.includes("administrator") && (
        <Button
          type="button"
          text
          label="Administration"
          onClick={() => void navigate(USER_ADMINISTRATION_ROUTE)}
        />
      )}
      <Button
        type="button"
        text
        label="Log out"
        loading={pending}
        onClick={() => void handleLogout()}
      />
    </div>
  );
}
