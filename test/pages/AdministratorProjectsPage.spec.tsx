import '@testing-library/jest-dom/vitest';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdministratorProjectsPage } from '@/pages/Administration/AdministratorProjectsPage';
import { actionBarStore, requestAdministratorAction } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({ useAdministratorProjects: vi.fn() }));

vi.mock('@/pages/Administration/useAdministratorProjects', () => ({
    useAdministratorProjects: mocks.useAdministratorProjects,
}));

const project = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Project Alpha',
    categoryNames: ['Authentication'],
    categoryCount: 1,
    categories: [{ name: 'Authentication', requirementCount: 3 }],
    requirementCount: 3,
    memberships: [
        {
            userId: '22222222-2222-4222-8222-222222222222',
            username: 'viewer',
            displayName: 'Viewer',
            role: 'viewer' as const,
        },
    ],
    ticketUrlTemplate: null,
};

function administrationState() {
    return {
        projects: [project],
        projectsLoading: false,
        projectsError: false,
        users: [
            {
                id: '33333333-3333-4333-8333-333333333333',
                username: 'developer',
                email: 'developer@example.org',
                displayName: 'Developer',
                status: 'active' as const,
                role: 'developer' as const,
                emailVerifiedAt: '2026-09-01T10:00:00.000Z',
                createdAt: '2026-09-01T09:00:00.000Z',
                updatedAt: '2026-09-01T10:00:00.000Z',
            },
        ],
        usersLoading: false,
        usersError: false,
        createProject: vi.fn().mockResolvedValue(project),
        updateProject: vi.fn().mockResolvedValue(project),
        deleteProject: vi.fn().mockResolvedValue(undefined),
        addMembership: vi.fn().mockResolvedValue(undefined),
        removeMembership: vi.fn().mockResolvedValue(undefined),
        mutationPending: false,
        mutationError: false,
    };
}

function renderPage(initialEntry = '/admin/projects') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path='/admin/projects/:projectId?'
                    element={<AdministratorProjectsPage />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    actionBarStore.setState(() => ({ requirementKey: '' }));
    vi.clearAllMocks();
});

describe('AdministratorProjectsPage', () => {
    it('shows a compact overview of every project on the projects root', () => {
        mocks.useAdministratorProjects.mockReturnValue(administrationState());
        renderPage();

        expect(screen.getByRole('table', { name: 'All projects' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Project Alpha' })).toHaveAttribute(
            'href',
            `/admin/projects/${project.id}`,
        );
        expect(screen.queryByText(/select a project from the sidebar/iu)).not.toBeInTheDocument();
    });

    it('shows only administrative project summary data and settings', () => {
        mocks.useAdministratorProjects.mockReturnValue(administrationState());
        renderPage(`/admin/projects/${project.id}`);

        expect(screen.getByRole('heading', { name: 'Project Alpha' })).toBeInTheDocument();
        expect(screen.getByRole('table', { name: 'Categories for Project Alpha' })).toBeInTheDocument();
        expect(screen.getByText('Authentication')).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: '3' })).toBeInTheDocument();
        expect(screen.getByLabelText('URL template')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Ticket URL template' })).toBeInTheDocument();
        expect(screen.getByRole('table', { name: 'Memberships for Project Alpha' })).toBeInTheDocument();
        expect(screen.queryByText(/Memberships use each account/iu)).not.toBeInTheDocument();
        expect(actionBarStore.state.administratorProjectActionContext?.deleteDisabled).toBe(true);
    });

    it('adds membership through the ActionBar-triggered dialog', async () => {
        const state = administrationState();
        mocks.useAdministratorProjects.mockReturnValue(state);
        const interaction = userEvent.setup();

        renderPage(`/admin/projects/${project.id}`);
        act(() => requestAdministratorAction('addMembership'));

        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
        await interaction.selectOptions(screen.getByLabelText('User'), '33333333-3333-4333-8333-333333333333');
        await interaction.click(screen.getByRole('button', { name: 'Add membership' }));

        expect(state.addMembership).toHaveBeenCalledWith({
            projectId: project.id,
            userId: '33333333-3333-4333-8333-333333333333',
        });
    });

    it('opens the shared project dialog when the ActionBar requests project creation', async () => {
        mocks.useAdministratorProjects.mockReturnValue(administrationState());
        renderPage();

        act(() => requestAdministratorAction('createProject'));

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Create project' })).toBeInTheDocument());
    });
});
