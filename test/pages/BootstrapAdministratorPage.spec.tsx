import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/fetch';
import { BootstrapAdministratorPage } from '@/pages/BootstrapAdministratorPage/BootstrapAdministratorPage';

const mocks = vi.hoisted(() => ({ bootstrapAdministrator: vi.fn() }));

vi.mock('@/api/authApi', () => ({ bootstrapAdministrator: mocks.bootstrapAdministrator }));

async function completeForm(): Promise<void> {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Username'), '  administrator  ');
    await user.type(screen.getByLabelText('Email address'), '  ADMIN@Example.org  ');
    await user.type(screen.getByLabelText('Display name'), '  Initial Administrator  ');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'correct horse battery staple');
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse battery staple');
    await user.type(screen.getByLabelText('Bootstrap secret'), '  setup-secret  ');
}

function renderPage() {
    const onContinueToLogin = vi.fn();
    const onBootstrapUnavailable = vi.fn();

    render(
        <BootstrapAdministratorPage
            onContinueToLogin={onContinueToLogin}
            onBootstrapUnavailable={onBootstrapUnavailable}
        />,
    );

    return { onContinueToLogin, onBootstrapUnavailable };
}

beforeEach(() => {
    mocks.bootstrapAdministrator.mockResolvedValue({ data: { message: 'Bootstrap registration received.' } });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('BootstrapAdministratorPage', () => {
    it('validates matching passwords before enabling registration.', async () => {
        const user = userEvent.setup();
        renderPage();

        expect(screen.getByRole('button', { name: 'Create Administrator' })).toBeDisabled();
        await user.type(screen.getByLabelText('Confirm password'), 'different password');

        expect(screen.getByText('Passwords must match.')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm password')).toHaveAttribute('aria-invalid', 'true');
    });

    it('submits normalized account data and explains the email-verification step.', async () => {
        const user = userEvent.setup();
        const callbacks = renderPage();
        await completeForm();

        await user.click(screen.getByRole('button', { name: 'Create Administrator' }));

        expect(mocks.bootstrapAdministrator).toHaveBeenCalledWith({
            username: 'administrator',
            email: 'admin@example.org',
            displayName: 'Initial Administrator',
            password: 'correct horse battery staple',
            bootstrapSecret: 'setup-secret',
        });
        expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Verify the email address before signing in.');

        await user.click(screen.getByRole('button', { name: 'Continue to sign in' }));
        expect(callbacks.onContinueToLogin).toHaveBeenCalledOnce();
    });

    it('switches to normal login when another request completed bootstrap first.', async () => {
        mocks.bootstrapAdministrator.mockRejectedValue(new ApiError('Conflict', 409, undefined));
        const user = userEvent.setup();
        const callbacks = renderPage();
        await completeForm();

        await user.click(screen.getByRole('button', { name: 'Create Administrator' }));

        expect(callbacks.onBootstrapUnavailable).toHaveBeenCalledOnce();
    });

    it('shows a specific retry-later message for rate limiting.', async () => {
        mocks.bootstrapAdministrator.mockRejectedValue(new ApiError('Rate limited', 429, undefined));
        const user = userEvent.setup();
        renderPage();
        await completeForm();

        await user.click(screen.getByRole('button', { name: 'Create Administrator' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Too many registration attempts. Wait before trying again.',
        );
    });
});
