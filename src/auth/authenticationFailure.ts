import { resetDomainCollections } from '@/api/collections/resetCollections';
import { queryClient } from '@/api/queryClient';
import { clearAuthenticatedSession } from '@/stores/authStore';
import { resetActionBarStore } from '@/stores/actionBarStore';
import { resetTabBarStore } from '@/stores/tabBarStore';

export type AuthenticationFailureListener = () => void;

const authenticationFailureListeners = new Set<AuthenticationFailureListener>();

/** Clears all data that must not cross an authentication boundary. */
export async function clearUserScopedState(reason?: 'session-expired'): Promise<void> {
    clearAuthenticatedSession(reason);
    resetActionBarStore();
    resetTabBarStore();
    await resetDomainCollections();
    queryClient.clear();
}

/** Clears user-scoped state and asks the router to return to login. */
export async function handleAuthenticationFailure(): Promise<void> {
    await clearUserScopedState('session-expired');

    for (const listener of authenticationFailureListeners) {
        listener();
    }
}

/** WP 2 uses this event to navigate to the login route without coupling fetch to React Router. */
export function subscribeToAuthenticationFailures(listener: AuthenticationFailureListener): () => void {
    authenticationFailureListeners.add(listener);

    return () => {
        authenticationFailureListeners.delete(listener);
    };
}
