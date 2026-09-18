import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { Link } from 'react-router';

import { resendEmailVerification } from '@/api/authApi';
import { isValidUsername } from '@/auth/accountValidation';
import { LOGIN_ROUTE } from '@/auth/authRoutes';

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
        <main className='ui-public-account'>
            <section
                className='ui-panel ui-panel--rounded ui-public-account__card'
                aria-labelledby='resend-verification-title'>
                <h1 id='resend-verification-title'>Resend verification email</h1>
                <p className='ui-public-account__intro'>Enter the local username used during registration.</p>
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
                            className='ui-button ui-button--primary ui-button--public-account'
                            type='submit'
                            label='Send verification email'
                            loading={pending}
                            disabled={!isValidUsername(username) || pending}
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
