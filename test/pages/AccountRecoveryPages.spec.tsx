import '@testing-library/jest-dom/vitest';

import { StrictMode, type ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmailVerificationPage } from '@/pages/EmailVerificationPage/EmailVerificationPage';
import { ResendEmailVerificationPage } from '@/pages/EmailVerificationPage/ResendEmailVerificationPage';
import { PasswordResetConfirmationPage } from '@/pages/PasswordResetPage/PasswordResetConfirmationPage';
import { PasswordResetRequestPage } from '@/pages/PasswordResetPage/PasswordResetRequestPage';

const mocks = vi.hoisted(() => ({
    confirmEmailVerification: vi.fn(),
    resendEmailVerification: vi.fn(),
    requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(),
}));

vi.mock('@/api/authApi', () => mocks);

function renderAt(route: string, element: ReactNode): void {
    render(<MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>);
}

beforeEach(() => {
    mocks.confirmEmailVerification.mockResolvedValue({ status: 204 });
    mocks.resendEmailVerification.mockResolvedValue({ data: { message: 'Accepted.' } });
    mocks.requestPasswordReset.mockResolvedValue({ data: { message: 'Accepted.' } });
    mocks.confirmPasswordReset.mockResolvedValue({ status: 204 });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('public account recovery pages', () => {
    it('confirms an email token only once under React Strict Mode', async () => {
        renderAt(
            '/verify-email?token=verification-token',
            <StrictMode>
                <EmailVerificationPage />
            </StrictMode>,
        );

        expect(await screen.findByText(/has been verified/iu)).toBeInTheDocument();
        expect(mocks.confirmEmailVerification).toHaveBeenCalledOnce();
        expect(mocks.confirmEmailVerification).toHaveBeenCalledWith('verification-token');
    });

    it('resends verification without revealing whether the account exists', async () => {
        const user = userEvent.setup();
        renderAt('/verify-email/resend', <ResendEmailVerificationPage />);

        await user.type(screen.getByLabelText('Username'), '  alice  ');
        await user.click(screen.getByRole('button', { name: 'Send verification email' }));

        expect(mocks.resendEmailVerification).toHaveBeenCalledWith('alice');
        expect(await screen.findByRole('status')).toHaveTextContent('If the account is eligible');
    });

    it('requests a password reset with a normalized email and a generic response', async () => {
        const user = userEvent.setup();
        renderAt('/forgot-password', <PasswordResetRequestPage />);

        await user.type(screen.getByLabelText('Email address'), '  ALICE@Example.org  ');
        await user.click(screen.getByRole('button', { name: 'Send reset email' }));

        expect(mocks.requestPasswordReset).toHaveBeenCalledWith('alice@example.org');
        expect(await screen.findByRole('status')).toHaveTextContent('If the account is eligible');
    });

    it('sets a new password using the reset token', async () => {
        const user = userEvent.setup();
        renderAt('/reset-password?token=reset-token', <PasswordResetConfirmationPage />);

        await user.type(screen.getByLabelText('New password'), 'new correct horse battery staple');
        await user.type(screen.getByLabelText('Confirm new password'), 'new correct horse battery staple');
        await user.click(screen.getByRole('button', { name: 'Change password' }));

        expect(mocks.confirmPasswordReset).toHaveBeenCalledWith('reset-token', 'new correct horse battery staple');
        expect(await screen.findByRole('status')).toHaveTextContent('Existing sessions have been revoked');
    });

    it('does not render a password form without a reset token', () => {
        renderAt('/reset-password', <PasswordResetConfirmationPage />);

        expect(screen.getByRole('alert')).toHaveTextContent('invalid or incomplete');
        expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
    });
});
