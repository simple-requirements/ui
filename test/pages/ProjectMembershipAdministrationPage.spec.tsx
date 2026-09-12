import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProjectMembershipAdministrationPage } from '@/pages/Administration/ProjectMembershipAdministrationPage';

const mocks = vi.hoisted(() => ({ useProjectMembershipAdministration: vi.fn() }));

vi.mock('@/pages/Administration/useProjectMembershipAdministration', () => ({
    useProjectMembershipAdministration: mocks.useProjectMembershipAdministration,
}));

const projectId = '11111111-1111-4111-8111-111111111111';

function administrationState(selectedProjectId: string | undefined) {
    return {
        projects: [
            {
                id: projectId,
                name: 'Project Alpha',
                createdAt: '2026-09-01T09:00:00.000Z',
                updatedAt: '2026-09-01T09:00:00.000Z',
                ticketUrlTemplate: null,
            },
        ],
        projectsLoading: false,
        projectsError: false,
        users:
            selectedProjectId === undefined ?
                []
            :   [
                    {
                        id: 'user-1',
                        username: 'alice',
                        email: 'alice@example.org',
                        displayName: 'Alice Member',
                        status: 'active' as const,
                        globalRoles: [],
                        emailVerifiedAt: '2026-09-01T10:00:00.000Z',
                        createdAt: '2026-09-01T09:00:00.000Z',
                        updatedAt: '2026-09-01T10:00:00.000Z',
                    },
                ],
        usersLoading: false,
        usersError: false,
        memberships:
            selectedProjectId === undefined ?
                []
            :   [{ userId: 'user-1', username: 'alice', displayName: 'Alice Member', roles: ['viewer' as const] }],
        membershipsLoading: false,
        membershipsError: false,
        mutationPending: false,
        setMembership: vi.fn(),
        removeMembership: vi.fn(),
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectMembershipAdministrationPage', () => {
    it('lets the Administrator select a project before showing memberships', async () => {
        mocks.useProjectMembershipAdministration.mockImplementation((selectedProjectId: string | undefined) =>
            administrationState(selectedProjectId),
        );
        const interaction = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/administration/project-memberships']}>
                <ProjectMembershipAdministrationPage />
            </MemoryRouter>,
        );

        expect(screen.getByText(/Select a project to view and manage/iu)).toBeInTheDocument();
        await interaction.selectOptions(screen.getByLabelText('Project'), projectId);

        await waitFor(() => expect(mocks.useProjectMembershipAdministration).toHaveBeenLastCalledWith(projectId));
        expect(screen.getByRole('table', { name: 'Memberships for Project Alpha' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Users and sessions' })).toHaveAttribute(
            'href',
            '/administration/users',
        );
    });
});
