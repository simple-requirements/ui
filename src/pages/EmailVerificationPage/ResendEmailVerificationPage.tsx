import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { Link } from 'react-router';

import { resendEmailVerification } from '@/api/authApi';
import { isValidUsername } from '@/auth/accountValidation';
import { LOGIN_ROUTE } from '@/auth/authRoutes';

import '@/pages/PublicAccountPage/PublicAccountPage.scss';

const GENERIC_RESPONSE = 'If the account is eligible, a verification email will be sent.';

export function ResendEmailVerificationPage() {
    const [username, setUsername] = useState('');
    const [pending, setPending] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(false);

    async function submit(): Promise<void> {
        if (!isValidUsername(username) || pending) return;
        setPending(true);
        setError(false);
        try {
            await resendEmailVerification(username.trim());
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
                aria-labelledby='resend-verification-title'>
                <h1 id='resend-verification-title'>Resend verification email</h1>
                <p>Enter the local username used during registration.</p>
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
                        <label htmlFor='resend-username'>Username</label>
                        <InputText
                            id='resend-username'
                            name='username'
                            autoComplete='username'
                            autoFocus
                            value={username}
                            disabled={pending}
                            onChange={(event) => setUsername(event.currentTarget.value)}
                        />
                        <Button
                            type='submit'
                            label='Send verification email'
                            loading={pending}
                            disabled={!isValidUsername(username) || pending}
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
