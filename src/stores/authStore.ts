import { createStore } from '@tanstack/react-store';

import type { AuthenticatedSession } from '@/auth/authTypes';

export type AuthState =
    | Readonly<{ status: 'unauthenticated'; accessToken?: undefined; user?: undefined; reason?: 'session-expired' }>
    | Readonly<{
          status: 'authenticated';
          accessToken: AuthenticatedSession['accessToken'];
          user: AuthenticatedSession['user'];
      }>;

const unauthenticatedState: AuthState = { status: 'unauthenticated' };

/**
 * Deliberately process-local. Authentication must not survive a reload or a
 * browser restart, so this state must never be synchronized to web storage.
 */
export const authStore = createStore<AuthState>(unauthenticatedState);

export function setAuthenticatedSession(session: AuthenticatedSession): void {
    authStore.setState(() => ({ status: 'authenticated', ...session }));
}

export function clearAuthenticatedSession(reason?: 'session-expired'): void {
    authStore.setState(() => (reason === undefined ? unauthenticatedState : { status: 'unauthenticated', reason }));
}

export function getAccessToken(): string | undefined {
    return authStore.state.accessToken;
}
