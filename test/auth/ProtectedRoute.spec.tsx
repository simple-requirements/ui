import '@testing-library/jest-dom/vitest';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { handleAuthenticationFailure } from '@/auth/authenticationFailure';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import type { AuthenticatedUser } from '@/auth/authTypes';
import { clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

const user: AuthenticatedUser = {
    id: '11111111-1111-4111-8111-111111111111',
    username: 'alice',
    email: 'alice@example.org',
    displayName: 'Alice',
    status: 'active',
    globalRoles: [],
};

function LoginProbe() {
    const location = useLocation();

    return (
        <>
            <h1>Login</h1>
            <output aria-label='Login state'>{JSON.stringify(location.state)}</output>
        </>
    );
}

function renderRoutes(initialEntry = '/private?view=details#owner') {
    const router = createMemoryRouter(
        [
            { path: '/login', element: <LoginProbe /> },
            { element: <ProtectedRoute />, children: [{ path: '/private', element: <h1>Private content</h1> }] },
        ],
        { initialEntries: [initialEntry] },
    );

    return { router, ...render(<RouterProvider router={router} />) };
}

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
});

describe('ProtectedRoute', () => {
    it('redirects unauthenticated users and preserves the complete requested URL.', async () => {
        renderRoutes();

        expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByLabelText('Login state')).toHaveTextContent(
            JSON.stringify({ returnTo: '/private?view=details#owner' }),
        );
    });

    it('renders protected content for an authenticated session.', () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });
        renderRoutes('/private');

        expect(screen.getByRole('heading', { name: 'Private content' })).toBeInTheDocument();
    });

    it('returns to login with an expiry reason when authentication fails.', async () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });
        renderRoutes('/private');

        act(() => handleAuthenticationFailure());

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument());
        expect(screen.getByLabelText('Login state')).toHaveTextContent('"reason":"session-expired"');
        expect(screen.getByLabelText('Login state')).toHaveTextContent('"returnTo":"/private"');
    });
});
