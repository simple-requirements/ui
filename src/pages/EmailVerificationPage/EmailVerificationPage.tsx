import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { confirmEmailVerification } from '@/api/authApi';
import { LOGIN_ROUTE, RESEND_EMAIL_VERIFICATION_ROUTE } from '@/router/authenticationRoutes';

type ConfirmationState = 'confirming' | 'confirmed' | 'invalid';

const confirmationRequests = new Map<string, Promise<ConfirmationState>>();

function confirmToken(token: string): Promise<ConfirmationState> {
    const pendingRequest = confirmationRequests.get(token);

    if (pendingRequest !== undefined) {
        return pendingRequest;
    }

    const request = confirmEmailVerification(token).then(
        () => 'confirmed' as const,
        () => 'invalid' as const,
    );
    confirmationRequests.set(token, request);

    return request;
}

export function EmailVerificationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';
    const [state, setState] = useState<ConfirmationState>(token.length > 0 ? 'confirming' : 'invalid');

    useEffect(() => {
        if (token.length === 0) {
            return;
        }

        let isActive = true;

        void confirmToken(token).then((confirmationState) => {
            if (isActive) {
                setState(confirmationState);
            }
        });

        return () => {
            isActive = false;
        };
    }, [token]);

    return (
        <main className='ui-public-account'>
            <section
                className='ui-panel ui-panel--rounded ui-public-account__card'
                aria-labelledby='email-verification-title'>
                <h1 id='email-verification-title'>Verify email address</h1>
                {state === 'confirming' && (
                    <p
                        className='ui-public-account__intro'
                        role='status'>
                        Verifying your email address…
                    </p>
                )}
                {state === 'confirmed' && (
                    <>
                        <p
                            className='ui-public-account__message ui-public-account__message--success'
                            role='status'>
                            Your email address has been verified. Regular accounts can sign in after an Administrator
                            has activated them.
                        </p>
                        <div className='ui-public-account__actions'>
                            <Link to={LOGIN_ROUTE}>Continue to sign in</Link>
                        </div>
                    </>
                )}
                {state === 'invalid' && (
                    <>
                        <p
                            className='ui-public-account__message ui-public-account__message--error'
                            role='alert'>
                            The verification link is invalid or has expired.
                        </p>
                        <div className='ui-public-account__actions'>
                            <Link to={RESEND_EMAIL_VERIFICATION_ROUTE}>Request another verification email</Link>
                            <Link to={LOGIN_ROUTE}>Return to sign in</Link>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
