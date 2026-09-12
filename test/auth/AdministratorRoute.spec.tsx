import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AdministratorRoute } from '@/auth/AdministratorRoute';
import type { AuthenticatedUser } from '@/auth/authTypes';
import { clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

function user(globalRoles: AuthenticatedUser['globalRoles']): AuthenticatedUser {
    return {
        id: 'user-1',
        username: 'alice',
        email: 'alice@example.org',
        displayName: 'Alice',
        status: 'active',
        globalRoles,
    };
}

function renderRoute(): void {
    const router = createMemoryRouter(
        [
            { path: '/', element: <h1>Workspace</h1> },
            {
                element: <AdministratorRoute />,
                children: [
                    { path: '/administration/users', element: <h1>User administration</h1> },
                    {
                        path: '/administration/project-memberships',
                        element: <h1>Project membership administration</h1>,
                    },
                ],
            },
        ],
        { initialEntries: ['/administration/users'] },
    );
    render(<RouterProvider router={router} />);
}

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
});

describe('AdministratorRoute', () => {
    it('renders administration for an Administrator', async () => {
        setAuthenticatedSession({ accessToken: 'token', user: user(['administrator']) });
        renderRoute();

        expect(await screen.findByRole('heading', { name: 'User administration' })).toBeInTheDocument();
    });

    it('renders project membership administration for an Administrator', async () => {
        setAuthenticatedSession({ accessToken: 'token', user: user(['administrator']) });
        const router = createMemoryRouter(
            [
                { path: '/', element: <h1>Workspace</h1> },
                {
                    element: <AdministratorRoute />,
                    children: [
                        {
                            path: '/administration/project-memberships',
                            element: <h1>Project membership administration</h1>,
                        },
                    ],
                },
            ],
            { initialEntries: ['/administration/project-memberships'] },
        );
        render(<RouterProvider router={router} />);

        expect(await screen.findByRole('heading', { name: 'Project membership administration' })).toBeInTheDocument();
    });

    it('redirects a non-Administrator to the workspace', async () => {
        setAuthenticatedSession({ accessToken: 'token', user: user([]) });
        renderRoute();

        expect(await screen.findByRole('heading', { name: 'Workspace' })).toBeInTheDocument();
    });
});
