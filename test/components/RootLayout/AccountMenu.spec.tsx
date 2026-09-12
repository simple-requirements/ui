import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedUser } from '@/auth/authTypes';
import { AccountMenu } from '@/components/RootLayout/AccountMenu/AccountMenu';
import { authStore, clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

const mocks = vi.hoisted(() => ({ logout: vi.fn() }));

vi.mock('@/api/authApi', () => ({ logout: mocks.logout }));

const user: AuthenticatedUser = {
    id: '11111111-1111-4111-8111-111111111111',
    username: 'alice',
    email: 'alice@example.org',
    displayName: 'Alice Example',
    status: 'active',
    globalRoles: [],
};

function LocationProbe() {
    return <output aria-label='Current route'>{useLocation().pathname}</output>;
}

/**
 * Renders the account menu inside a memory router for route assertions.
 * @returns Render result for the account menu test harness.
 */
function renderAccountMenu() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <AccountMenu />
            <Routes>
                <Route
                    path='*'
                    element={<LocationProbe />}
                />
            </Routes>
        </MemoryRouter>,
    );
}


/**
 * Opens the account menu popup for assertions that target menu content.
 * @param interaction User-event driver used to click the cog wheel button.
 * @returns Promise that resolves once the menu button click completed.
 */
async function openAccountMenu(interaction: ReturnType<typeof userEvent.setup>): Promise<void> {
    await interaction.click(screen.getByRole('button', { name: 'Account menu' }));
}

beforeEach(() => {
    mocks.logout.mockResolvedValue({ data: undefined, status: 204, headers: new Headers() });
});

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
    vi.clearAllMocks();
});

describe('AccountMenu', () => {
    it('shows administration navigation only to Administrators.', async () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user: { ...user, globalRoles: ['administrator'] } });
        const interaction = userEvent.setup();
        renderAccountMenu();

        await openAccountMenu(interaction);

        expect(await screen.findByText('Administration')).toBeInTheDocument();
    });

    it('hides administration navigation from regular users.', async () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });
        const interaction = userEvent.setup();
        renderAccountMenu();

        await openAccountMenu(interaction);

        expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });

    it('shows the authenticated identity and logs out through the API.', async () => {
        setAuthenticatedSession({ accessToken: 'opaque-token', user });
        const interaction = userEvent.setup();
        renderAccountMenu();

        await openAccountMenu(interaction);

        expect(await screen.findByText('Alice Example')).toBeInTheDocument();
        expect(screen.getByText('@alice')).toBeInTheDocument();
        await interaction.click(screen.getByText('Logout'));

        await waitFor(() => expect(screen.getByLabelText('Current route')).toHaveTextContent('/login'));
        expect(mocks.logout).toHaveBeenCalledOnce();
        expect(authStore.state.status).toBe('unauthenticated');
    });

    it('completes local logout even when the backend request fails.', async () => {
        mocks.logout.mockRejectedValue(new Error('Network unavailable'));
        setAuthenticatedSession({ accessToken: 'opaque-token', user });
        const interaction = userEvent.setup();
        renderAccountMenu();

        await openAccountMenu(interaction);
        await interaction.click(await screen.findByText('Logout'));

        await waitFor(() => expect(authStore.state.status).toBe('unauthenticated'));
        expect(screen.getByLabelText('Current route')).toHaveTextContent('/login');
    });
});
