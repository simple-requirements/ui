import '@testing-library/jest-dom/vitest';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserAdministrationPage } from '@/pages/Administration/UserAdministrationPage';
import { authStore, clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';
import { actionBarStore, requestAdministratorAction } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({
    useUserAdministration: vi.fn(),
    useUserPresence: vi.fn(),
    showToastMessage: vi.fn(),
}));

vi.mock('@/pages/Administration/useUserAdministration', () => ({ useUserAdministration: mocks.useUserAdministration }));
vi.mock('@/pages/Administration/useUserPresence', () => ({ useUserPresence: mocks.useUserPresence }));
vi.mock('@/stores/toastStore', () => ({ showToastMessage: mocks.showToastMessage }));

type StatusChange = Readonly<{ status: 'active' | 'deactivated' }>;

const user = {
    id: '11111111-1111-4111-8111-111111111111',
    username: 'developer',
    email: 'developer@example.org',
    displayName: 'Developer',
    status: 'active' as const,
    role: 'developer' as const,
    emailVerifiedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
};

function state() {
    return {
        users: [user],
        usersLoading: false,
        usersError: false,
        mutationPending: false,
        changeRole: vi.fn(),
        changeRoleAsync: vi.fn().mockResolvedValue({ ...user, status: 'deactivated' }),
        changeStatus: vi.fn(),
        changeStatusAsync: vi
            .fn()
            .mockImplementation(({ status }: StatusChange) => Promise.resolve({ ...user, status })),
        revokeAllSessions: vi.fn(),
    };
}

function renderPage(initialEntry = '/admin/users') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path='/admin/users/:userId?'
                    element={<UserAdministrationPage />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
    actionBarStore.setState(() => ({ requirementKey: '' }));
    vi.clearAllMocks();
});

describe('UserAdministrationPage', () => {
    it('renders the expanded full-width user table with login presence and actions', () => {
        mocks.useUserAdministration.mockReturnValue(state());
        mocks.useUserPresence.mockReturnValue(
            new Map([[user.id, { active: true, activeSessionCount: 1, loading: false, error: false }]]),
        );

        renderPage();

        expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Created at' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Email verified at' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Is active' })).toBeInTheDocument();
        expect(screen.getByLabelText('Logged in')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Deactivate Developer' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Log out Developer' })).toBeInTheDocument();
    });

    it('disables self-deactivation and self-session revocation in the user table', () => {
        const administrator = {
            ...user,
            id: 'admin-1',
            username: 'administrator',
            displayName: 'Administrator',
            role: 'administrator' as const,
        };
        mocks.useUserAdministration.mockReturnValue({ ...state(), users: [administrator] });
        mocks.useUserPresence.mockReturnValue(
            new Map([[administrator.id, { active: true, activeSessionCount: 1, loading: false, error: false }]]),
        );
        act(() => {
            setAuthenticatedSession({
                accessToken: 'token',
                user: {
                    id: administrator.id,
                    username: administrator.username,
                    email: administrator.email,
                    displayName: administrator.displayName,
                    status: administrator.status,
                    role: administrator.role,
                },
            });
        });

        expect(authStore.state.user?.id).toBe(administrator.id);
        renderPage();

        expect(screen.getByRole('button', { name: 'Deactivate Administrator' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Log out Administrator' })).toBeDisabled();
    });

    it('blocks the role dialog while the selected user is logged in', async () => {
        const administration = state();
        mocks.useUserAdministration.mockReturnValue(administration);
        mocks.useUserPresence.mockReturnValue(
            new Map([[user.id, { active: true, activeSessionCount: 1, loading: false, error: false }]]),
        );
        const interaction = userEvent.setup();

        renderPage();
        await interaction.click(screen.getByRole('button', { name: 'Developer' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(administration.changeStatusAsync).not.toHaveBeenCalled();
        expect(mocks.showToastMessage).toHaveBeenCalledOnce();
        const toastMessage: unknown = mocks.showToastMessage.mock.calls[0]?.[0];
        expect(toastMessage).toEqual({
            severity: 'error',
            summary: 'Account role cannot be changed',
            detail: 'Developer is currently logged in and cannot be temporarily deactivated. Log the user out first.',
            life: 5000,
        });
    });

    it('temporarily deactivates an active logged-out user before opening the role dialog and reactivates on cancel', async () => {
        const administration = state();
        administration.changeStatusAsync.mockImplementation(({ status }: StatusChange) =>
            Promise.resolve({ ...user, status }),
        );
        mocks.useUserAdministration.mockReturnValue(administration);
        mocks.useUserPresence.mockReturnValue(
            new Map([[user.id, { active: false, activeSessionCount: 0, loading: false, error: false }]]),
        );
        const interaction = userEvent.setup();

        renderPage();
        await interaction.click(screen.getByRole('button', { name: 'Developer' }));

        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
        expect(administration.changeStatusAsync).toHaveBeenNthCalledWith(1, {
            user,
            status: 'deactivated',
            notify: false,
        });

        await interaction.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(administration.changeStatusAsync).toHaveBeenCalledTimes(2));
        expect(administration.changeStatusAsync).toHaveBeenNthCalledWith(2, {
            user: { ...user, status: 'deactivated' },
            status: 'active',
            notify: false,
        });
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('saves a role change and restores the temporarily deactivated account', async () => {
        const administration = state();
        const deactivatedUser = { ...user, status: 'deactivated' as const };
        const changedUser = { ...deactivatedUser, role: 'viewer' as const };
        administration.changeStatusAsync.mockImplementation(({ status }: StatusChange) =>
            Promise.resolve({ ...user, status }),
        );
        administration.changeRoleAsync.mockResolvedValue(changedUser);
        mocks.useUserAdministration.mockReturnValue(administration);
        mocks.useUserPresence.mockReturnValue(
            new Map([[user.id, { active: false, activeSessionCount: 0, loading: false, error: false }]]),
        );
        const interaction = userEvent.setup();

        renderPage();
        await interaction.click(screen.getByRole('button', { name: 'Developer' }));
        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
        await interaction.selectOptions(screen.getByLabelText('Role'), 'viewer');
        await interaction.click(screen.getByRole('button', { name: 'Save role' }));

        await waitFor(() =>
            expect(administration.changeRoleAsync).toHaveBeenCalledWith({ user: deactivatedUser, role: 'viewer' }),
        );
        await waitFor(() =>
            expect(administration.changeStatusAsync).toHaveBeenLastCalledWith({
                user: changedUser,
                status: 'active',
                notify: false,
            }),
        );
    });

    it('moves selected-user account status administration into the ActionBar', async () => {
        const administration = state();
        mocks.useUserAdministration.mockReturnValue(administration);
        mocks.useUserPresence.mockReturnValue(
            new Map([[user.id, { active: false, activeSessionCount: 0, loading: false, error: false }]]),
        );

        renderPage(`/admin/users/${user.id}`);
        act(() => requestAdministratorAction('toggleUserStatus'));

        await waitFor(() => expect(administration.changeStatus).toHaveBeenCalledWith({ user, status: 'deactivated' }));
        expect(screen.queryByRole('button', { name: 'Deactivate account' })).not.toBeInTheDocument();
    });

    it('shows user metadata without the old sessions section or account-role dropdown', () => {
        mocks.useUserAdministration.mockReturnValue(state());
        mocks.useUserPresence.mockReturnValue(
            new Map([[user.id, { active: false, activeSessionCount: 0, loading: false, error: false }]]),
        );

        renderPage(`/admin/users/${user.id}`);

        expect(screen.getByRole('heading', { name: 'Developer' })).toBeInTheDocument();
        expect(screen.getByText('developer@example.org')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Developer' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Sessions' })).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Account role')).not.toBeInTheDocument();
    });
});
