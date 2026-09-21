import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { ProjectPermissionRoute } from '@/auth/ProjectPermissionRoute';
import { projectPermissionKinds } from '@/auth/projectPermissions';
import type { AccountRole, AuthenticatedUser } from '@/auth/authTypes';
import { clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

const projectId = 'project-alpha';

function user(role: AccountRole, member = true): AuthenticatedUser {
    return {
        id: 'user-1',
        username: 'alice',
        email: 'alice@example.org',
        displayName: 'Alice',
        status: 'active',
        role,
        projectMemberships: member ? [{ projectId }] : [],
    };
}

function renderRoute(permission: 'read' | 'manage_requirements', initialEntry = `/projects/${projectId}/requirements`) {
    const router = createMemoryRouter(
        [
            { path: '/', element: <h1>Workspace</h1> },
            { path: `/projects/${projectId}`, element: <h1>Project overview</h1> },
            {
                path: '/projects/:projectId',
                element: <ProjectPermissionRoute permission={permission} />,
                children: [{ path: 'requirements', element: <h1>Requirements</h1> }],
            },
        ],
        { initialEntries: [initialEntry] },
    );

    render(<RouterProvider router={router} />);
}

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
});

describe('ProjectPermissionRoute', () => {
    it('renders project content when the account has the required permission', async () => {
        setAuthenticatedSession({ accessToken: 'token', user: user('requirements_engineer') });
        renderRoute(projectPermissionKinds.manageRequirements);

        expect(await screen.findByRole('heading', { name: 'Requirements' })).toBeInTheDocument();
    });

    it('redirects a member without mutation permission to the project overview', async () => {
        setAuthenticatedSession({ accessToken: 'token', user: user('viewer') });
        renderRoute(projectPermissionKinds.manageRequirements);

        expect(await screen.findByRole('heading', { name: 'Project overview' })).toBeInTheDocument();
    });

    it('redirects a non-member without read permission to the workspace', async () => {
        setAuthenticatedSession({ accessToken: 'token', user: user('viewer', false) });
        renderRoute(projectPermissionKinds.read);

        expect(await screen.findByRole('heading', { name: 'Workspace' })).toBeInTheDocument();
    });
});
