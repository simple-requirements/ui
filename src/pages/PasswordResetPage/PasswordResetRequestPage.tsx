import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { Link } from 'react-router';

import { requestPasswordReset } from '@/api/authApi';
import { isValidEmail } from '@/auth/accountValidation';
import { LOGIN_ROUTE } from '@/router/authenticationRoutes';

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
        <main className='ui-public-account'>
            <section
                className='ui-panel ui-panel--rounded ui-public-account__card'
                aria-labelledby='password-reset-request-title'>
                <h1 id='password-reset-request-title'>Reset password</h1>
                <p className='ui-public-account__intro'>Enter the email address associated with your local account.</p>
                {completed && (
                    <p
                        className='ui-public-account__message ui-public-account__message--success'
                        role='status'>
                        {GENERIC_RESPONSE}
                    </p>
                )}
                {error && (
                    <p
                        className='ui-public-account__message ui-public-account__message--error'
                        role='alert'>
                        The request could not be submitted. Try again later.
                    </p>
                )}
                {!completed && (
                    <form
                        className='ui-form ui-form--flush ui-form--compact ui-public-account__form'
                        onSubmit={(event) => {
                            event.preventDefault();
                            void submit();
                        }}>
                        <label htmlFor='password-reset-email'>Email address</label>
                        <InputText
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
                            className='ui-button ui-button--primary ui-button--public-account'
                            type='submit'
                            label='Send reset email'
                            loading={pending}
                            disabled={!isValidEmail(email) || pending}
                        />
                    </form>
                )}
                <div className='ui-public-account__actions'>
                    <Link to={LOGIN_ROUTE}>Return to sign in</Link>
                </div>
            </section>
        </main>
    );
}
