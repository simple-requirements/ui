import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { confirmPasswordReset } from '@/api/authApi';
import { isValidPassword } from '@/auth/accountValidation';
import { LOGIN_ROUTE } from '@/auth/authRoutes';

import '@/pages/PublicAccountPage/PublicAccountPage.scss';

/**
 * Renders the password-reset confirmation form for a reset token.
 * @returns Password-reset confirmation page.
 */
export function PasswordResetConfirmationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [pending, setPending] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const passwordsMatch = password === confirmation;
    const valid = token.length > 0 && isValidPassword(password) && passwordsMatch;

    async function submit(): Promise<void> {
        if (!valid || pending) return;
        setPending(true);
        setErrorMessage(undefined);
        try {
            await confirmPasswordReset(token, password);
            setCompleted(true);
        } catch {
            setErrorMessage('The password-reset link is invalid, expired, or has already been used.');
        } finally {
            setPending(false);
        }
    }

    return (
        <main className='public-account-page'>
            <section
                className='public-account-page__panel'
                aria-labelledby='password-reset-title'>
                <h1 id='password-reset-title'>Choose a new password</h1>
                {token.length === 0 && (
                    <p
                        className='public-account-page__error'
                        role='alert'>
                        The password-reset link is invalid or incomplete.
                    </p>
                )}
                {completed ?
                    <>
                        <p
                            className='public-account-page__status'
                            role='status'>
                            Your password has been changed. Existing sessions have been revoked.
                        </p>
                        <div className='public-account-page__actions'>
                            <Link to={LOGIN_ROUTE}>Continue to sign in</Link>
                        </div>
                    </>
                : token.length > 0 ?
                    <>
                        {errorMessage !== undefined && (
                            <p
                                className='public-account-page__error'
                                role='alert'>
                                {errorMessage}
                            </p>
                        )}
                        <form
                            className='public-account-page__form'
                            onSubmit={(event) => {
                                event.preventDefault();
                                void submit();
                            }}>
                            <label htmlFor='new-password'>New password</label>
                            <InputText
                                id='new-password'
                                name='new-password'
                                type='password'
                                autoComplete='new-password'
                                autoFocus
                                minLength={15}
                                maxLength={128}
                                value={password}
                                disabled={pending}
                                onChange={(event) => setPassword(event.currentTarget.value)}
                            />
                            <small>Use between 15 and 128 characters.</small>
                            <label htmlFor='confirm-new-password'>Confirm new password</label>
                            <InputText
                                id='confirm-new-password'
                                name='confirm-password'
                                type='password'
                                autoComplete='new-password'
                                value={confirmation}
                                disabled={pending}
                                aria-invalid={confirmation.length > 0 && !passwordsMatch}
                                onChange={(event) => setConfirmation(event.currentTarget.value)}
                            />
                            {confirmation.length > 0 && !passwordsMatch && (
                                <small className='public-account-page__validation-error'>Passwords must match.</small>
                            )}
                            <Button
                                type='submit'
                                label='Change password'
                                loading={pending}
                                disabled={!valid || pending}
                            />
                        </form>
                    </>
                :   <div className='public-account-page__actions'>
                        <Link to='/forgot-password'>Request a new reset link</Link>
                    </div>
                }
            </section>
        </main>
    );
}
