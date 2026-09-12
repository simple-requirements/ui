import { Button } from 'primereact/button';
import { useState } from 'react';
import { Link } from 'react-router';

import { requestPasswordReset } from '@/api/authApi';
import { isValidEmail } from '@/auth/accountValidation';
import { LOGIN_ROUTE } from '@/auth/authRoutes';

import '@/pages/PublicAccountPage/PublicAccountPage.scss';

const GENERIC_RESPONSE = 'If the account is eligible, a password-reset email will be sent.';

/**
 * Renders the password-reset request form.
 * @returns Page for requesting a password-reset email.
 */
export function PasswordResetRequestPage() {
    const [email, setEmail] = useState('');
    const [pending, setPending] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(false);

    /**
     * Requests a password-reset email for the entered address.
     * @returns Promise that resolves after the request completes.
     */
    async function submit(): Promise<void> {
        if (!isValidEmail(email) || pending) return;
        setPending(true);
        setError(false);
        try {
            await requestPasswordReset(email.trim().toLowerCase());
            setCompleted(true);
        } catch {
            setError(true);
        } finally {
            setPending(false);
        }
    }

    return (
        <main className='public-account-page'>
            <section
                className='public-account-page__panel'
                aria-labelledby='password-reset-request-title'>
                <h1 id='password-reset-request-title'>Reset password</h1>
                <p>Enter the email address associated with your local account.</p>
                {completed && (
                    <p
                        className='public-account-page__status'
                        role='status'>
                        {GENERIC_RESPONSE}
                    </p>
                )}
                {error && (
                    <p
                        className='public-account-page__error'
                        role='alert'>
                        The request could not be submitted. Try again later.
                    </p>
                )}
                {!completed && (
                    <form
                        className='public-account-page__form'
                        onSubmit={(event) => {
                            event.preventDefault();
                            void submit();
                        }}>
                        <label htmlFor='password-reset-email'>Email address</label>
                        <input
                            id='password-reset-email'
                            name='email'
                            type='email'
                            autoComplete='email'
                            autoFocus
                            value={email}
                            disabled={pending}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                        />
                        <Button
                            type='submit'
                            label='Send reset email'
                            loading={pending}
                            disabled={!isValidEmail(email) || pending}
                        />
                    </form>
                )}
                <div className='public-account-page__actions'>
                    <Link to={LOGIN_ROUTE}>Return to sign in</Link>
                </div>
            </section>
        </main>
    );
}
