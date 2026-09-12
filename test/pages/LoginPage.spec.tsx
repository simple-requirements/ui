import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedUser } from '@/auth/authTypes';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { authStore, clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

const mocks = vi.hoisted(() => ({ login: vi.fn(), getAuthenticatedUser: vi.fn() }));

vi.mock('@/api/authApi', () => ({ login: mocks.login, getAuthenticatedUser: mocks.getAuthenticatedUser }));

const authenticatedUser: AuthenticatedUser = {
    id: '11111111-1111-4111-8111-111111111111',
    username: 'alice',
    email: 'alice@example.org',
    displayName: 'Alice',
    status: 'active',
    globalRoles: [],
};

function DestinationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{`${location.pathname}${location.search}${location.hash}`}</output>;
}

function renderLogin(state?: unknown) {
    const router = createMemoryRouter(
        [
            { path: '/login', element: <LoginPage /> },
            { path: '*', element: <DestinationProbe /> },
        ],
        { initialEntries: [{ pathname: '/login', state }] },
    );

    return render(<RouterProvider router={router} />);
}

beforeEach(() => {
    mocks.login.mockResolvedValue({ data: { accessToken: 'opaque-token', user: authenticatedUser } });
    mocks.getAuthenticatedUser.mockResolvedValue({ data: authenticatedUser });
});

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
    vi.clearAllMocks();
});

describe('LoginPage', () => {
    it('styles the password field like the username field while preserving password input behavior.', () => {
        renderLogin();

        const username = screen.getByLabelText('Username');
        const password = screen.getByLabelText('Password');

        expect(username).toHaveClass('p-inputtext');
        expect(password).toHaveClass('p-inputtext');
        expect(password).toHaveAttribute('type', 'password');
    });

    it('links to registration and password recovery.', () => {
        renderLogin();

        expect(screen.getByRole('link', { name: 'Do not have an account? Register yourself.' })).toHaveAttribute(
            'href',
            '/register',
        );
        expect(screen.getByRole('link', { name: 'Forgot your password? Reset it here.' })).toHaveAttribute(
            'href',
            '/forgot-password',
        );
        expect(screen.queryByRole('link', { name: 'Resend verification email' })).not.toBeInTheDocument();
    });

    it('signs in, stores the session, and returns to the requested route.', async () => {
        const user = userEvent.setup();
        renderLogin({ returnTo: '/projects/one/requirements?filter=open#details' });

        await user.type(screen.getByLabelText('Username'), '  alice  ');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        await waitFor(() =>
            expect(screen.getByLabelText('Current route')).toHaveTextContent(
                '/projects/one/requirements?filter=open#details',
            ),
        );
        expect(mocks.login).toHaveBeenCalledWith({ username: 'alice', password: 'password' });
        expect(mocks.getAuthenticatedUser).toHaveBeenCalledWith('opaque-token');
        expect(authStore.state).toEqual({
            status: 'authenticated',
            accessToken: 'opaque-token',
            user: authenticatedUser,
        });
    });

    it('shows a generic error without disclosing the account state.', async () => {
        mocks.login.mockRejectedValue(new Error('User is deactivated'));
        const user = userEvent.setup();
        renderLogin();

        await user.type(screen.getByLabelText('Username'), 'alice');
        await user.type(screen.getByLabelText('Password'), 'wrong-password');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'The username or password is invalid, or the account is unavailable.',
        );
        expect(screen.queryByText(/deactivated/i)).not.toBeInTheDocument();
    });

    it('explains when the previous session expired.', () => {
        renderLogin({ returnTo: '/projects/one', reason: 'session-expired' });

        expect(screen.getByRole('status')).toHaveTextContent('Your session has ended. Sign in again to continue.');
    });

    it('redirects an already authenticated user without showing the login form.', async () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user: authenticatedUser });
        renderLogin({ returnTo: '/projects/one' });

        expect(await screen.findByLabelText('Current route')).toHaveTextContent('/projects/one');
        expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
    });
});
