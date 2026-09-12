import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthenticationEntryPage } from '@/pages/AuthenticationEntryPage/AuthenticationEntryPage';

const mocks = vi.hoisted(() => ({
    getAuthenticationBootstrapStatus: vi.fn(),
    bootstrapAdministrator: vi.fn(),
    login: vi.fn(),
}));

vi.mock('@/api/authApi', () => ({
    getAuthenticationBootstrapStatus: mocks.getAuthenticationBootstrapStatus,
    bootstrapAdministrator: mocks.bootstrapAdministrator,
    login: mocks.login,
}));

function renderPage() {
    return render(
        <MemoryRouter>
            <AuthenticationEntryPage />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mocks.getAuthenticationBootstrapStatus.mockResolvedValue({ data: { registrationAvailable: false } });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('AuthenticationEntryPage', () => {
    it('shows login after confirming that bootstrap is complete.', async () => {
        renderPage();

        expect(screen.getByRole('status')).toHaveTextContent('Checking application setup');
        expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('shows initial Administrator registration while bootstrap is available.', async () => {
        mocks.getAuthenticationBootstrapStatus.mockResolvedValue({ data: { registrationAvailable: true } });

        renderPage();

        expect(await screen.findByRole('heading', { name: 'Create initial Administrator' })).toBeInTheDocument();
    });

    it('does not expose login when bootstrap status cannot be established and supports retry.', async () => {
        mocks.getAuthenticationBootstrapStatus.mockRejectedValueOnce(new Error('Network unavailable'));
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByRole('alert')).toHaveTextContent('The application setup status could not be loaded.');
        expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Try again' }));

        await waitFor(() => expect(mocks.getAuthenticationBootstrapStatus).toHaveBeenCalledTimes(2));
        expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('rejects malformed bootstrap status responses.', async () => {
        mocks.getAuthenticationBootstrapStatus.mockResolvedValue({ data: {} });

        renderPage();

        expect(await screen.findByRole('alert')).toHaveTextContent('The application setup status could not be loaded.');
    });
});
