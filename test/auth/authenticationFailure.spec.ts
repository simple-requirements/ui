import { afterEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/api/queryClient";
import {
  handleAuthenticationFailure,
  subscribeToAuthenticationFailures,
} from "@/auth/authenticationFailure";
import type { AuthenticatedUser } from "@/auth/authTypes";
import {
  actionBarStore,
  resetActionBarStore,
  setRequirementKey,
} from "@/stores/actionBarStore";
import {
  authStore,
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "@/stores/authStore";
import { openTab, resetTabBarStore, tabBarStore } from "@/stores/tabBarStore";

const user: AuthenticatedUser = {
  id: "user-1",
  username: "alice",
  email: "alice@example.org",
  displayName: "Alice",
  status: "active",
  globalRoles: [],
};

afterEach(() => {
  clearAuthenticatedSession();
  queryClient.clear();
  resetActionBarStore();
  resetTabBarStore();
});

describe("handleAuthenticationFailure", () => {
  it("clears every user-scoped store and notifies navigation listeners.", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuthenticationFailures(listener);
    setAuthenticatedSession({ accessToken: "opaque-token", user });
    queryClient.setQueryData(["private-data"], { secret: true });
    setRequirementKey("FR-AUTH-0001");
    openTab({ id: "/projects/project-1", label: "Private project" });

    handleAuthenticationFailure();

    expect(authStore.state.status).toBe("unauthenticated");
    expect(queryClient.getQueryData(["private-data"])).toBeUndefined();
    expect(actionBarStore.state).toEqual({ requirementKey: "" });
    expect(tabBarStore.state).toEqual({
      openTabs: [{ id: "/", label: "Workspace", fixed: true, closable: false }],
      activeTabId: "/",
    });
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
