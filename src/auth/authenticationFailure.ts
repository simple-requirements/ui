import { queryClient } from "@/api/queryClient";
import { clearAuthenticatedSession } from "@/stores/authStore";
import { resetActionBarStore } from "@/stores/actionBarStore";
import { resetTabBarStore } from "@/stores/tabBarStore";

export type AuthenticationFailureListener = () => void;

const authenticationFailureListeners = new Set<AuthenticationFailureListener>();

/** Clears all data that must not cross an authentication boundary. */
export function clearUserScopedState(reason?: "session-expired"): void {
  clearAuthenticatedSession(reason);
  queryClient.clear();
  resetActionBarStore();
  resetTabBarStore();
}

/** Clears user-scoped state and asks the router to return to login. */
export function handleAuthenticationFailure(): void {
  clearUserScopedState("session-expired");

  for (const listener of authenticationFailureListeners) {
    listener();
  }
}

/** WP 2 uses this event to navigate to the login route without coupling fetch to React Router. */
export function subscribeToAuthenticationFailures(
  listener: AuthenticationFailureListener,
): () => void {
  authenticationFailureListeners.add(listener);

  return () => {
    authenticationFailureListeners.delete(listener);
  };
}
