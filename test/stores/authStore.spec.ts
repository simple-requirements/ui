import { afterEach, describe, expect, it } from 'vitest';

import type { AuthenticatedUser } from '@/auth/authTypes';
import { authStore, clearAuthenticatedSession, getAccessToken, setAuthenticatedSession } from '@/stores/authStore';

const user: AuthenticatedUser = {
    id: 'user-1',
    username: 'alice',
    email: 'alice@example.org',
    displayName: 'Alice',
    status: 'active',
    globalRoles: [],
};

afterEach(() => {
    clearAuthenticatedSession();
});

describe('authStore', () => {
    it('starts unauthenticated and exposes no token.', () => {
        expect(authStore.state).toEqual({ status: 'unauthenticated' });
        expect(getAccessToken()).toBeUndefined();
    });

    it('keeps the authenticated user and opaque token in memory.', () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });

        expect(authStore.state).toEqual({ status: 'authenticated', accessToken: 'opaque-token', user });
        expect(getAccessToken()).toBe('opaque-token');
    });

    it('removes the complete authenticated session.', () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });

        clearAuthenticatedSession();

        expect(authStore.state).toEqual({ status: 'unauthenticated' });
    });

    it('can retain the reason why an authenticated session ended.', () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });

        clearAuthenticatedSession('session-expired');

        expect(authStore.state).toEqual({ status: 'unauthenticated', reason: 'session-expired' });
    });
});
