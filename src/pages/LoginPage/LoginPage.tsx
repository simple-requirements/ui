import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useSelector } from '@tanstack/react-store';

import { getAuthenticatedUser, login } from '@/api/authApi';
import { getSafeReturnTo } from '@/auth/authRoutes';
import { authStore, setAuthenticatedSession } from '@/stores/authStore';

const LOGIN_ERROR_MESSAGE = 'The username or password is invalid, or the account is unavailable.';

type LoginPageProps = Readonly<{ notice?: string }>;

/**
 * Checks whether a router location state describes an expired session.
 * @param state Router location state to inspect.
 * @returns True when the route state contains the session-expired reason.
 */
function isSessionExpiredState(state: unknown): state is Readonly<{ reason: 'session-expired' }> {
    return typeof state === 'object' && state !== null && 'reason' in state && state.reason === 'session-expired';
}

/**
 * Renders the local account sign-in form.
 * @param notice Optional status text shown above the form.
 * @returns Login page for local authentication.
 */
export function LoginPage({ notice }: LoginPageProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const authenticationStatus = useSelector(authStore, (state) => state.status);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const returnTo = getSafeReturnTo(location.state);
    const sessionExpired = isSessionExpiredState(location.state);
    const valid = username.trim().length > 0 && password.length > 0;

    if (authenticationStatus === 'authenticated') {
        return (
            <Navigate
                to={returnTo}
                replace
            />
        );
    }

    /**
     * Authenticates the entered credentials and stores the memory-only session.
     * @returns Promise that resolves after the login attempt has completed.
     */
    async function handleSubmit(): Promise<void> {
        if (!valid || pending) {
            return;
        }

        setPending(true);
        setErrorMessage(undefined);

        try {
            const response = await login({ username: username.trim(), password });
            const currentUser = await getAuthenticatedUser(response.data.accessToken);
            setAuthenticatedSession({ accessToken: response.data.accessToken, user: currentUser.data });
            void navigate(returnTo, { replace: true });
        } catch {
            setErrorMessage(LOGIN_ERROR_MESSAGE);
        } finally {
            setPending(false);
        }
    }

    return (
        <main className='ui-public-account'>
            <section
                className='ui-panel ui-panel--rounded ui-public-account__card ui-public-account__card--compact'
                aria-labelledby='login-title'>
                <h1 id='login-title'>Sign in</h1>
                <p className='ui-public-account__intro'>Sign in with your local account.</p>

                {(notice !== undefined || sessionExpired) && (
                    <p
                        className='ui-public-account__message ui-public-account__message--info'
                        role='status'>
                        {notice ?? 'Your session has ended. Sign in again to continue.'}
                    </p>
                )}

                {errorMessage !== undefined && (
                    <p
                        className='ui-public-account__message ui-public-account__message--error'
                        role='alert'>
                        {errorMessage}
                    </p>
                )}

                <form
                    className='ui-form ui-form--flush ui-form--compact ui-public-account__form ui-public-account__form--separated'
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit();
                    }}>
                    <label htmlFor='login-username'>Username</label>
                    <InputText
                        id='login-username'
                        name='username'
                        autoComplete='username'
                        autoFocus
                        value={username}
                        disabled={pending}
                        onChange={(event) => setUsername(event.currentTarget.value)}
                    />

                    <label htmlFor='login-password'>Password</label>
                    <InputText
                        id='login-password'
                        name='password'
                        type='password'
                        autoComplete='current-password'
                        value={password}
                        disabled={pending}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />

                    <Button
                        className='ui-button ui-button--primary ui-button--public-account'
                        type='submit'
                        label='Sign in'
                        loading={pending}
                        disabled={!valid || pending}
                    />
                </form>
                <div className='ui-public-account__actions'>
                    <Link to='/register'>Do not have an account? Register yourself.</Link>
                    <Link to='/forgot-password'>Forgot your password? Reset it here.</Link>
                </div>
            </section>
        </main>
    );
}
