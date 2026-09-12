import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { subscribeToAuthenticationFailures } from '@/auth/authenticationFailure';
import { getCurrentRelativeUrl, LOGIN_ROUTE } from '@/auth/authRoutes';

export function AuthenticationFailureNavigator() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(
        () =>
            subscribeToAuthenticationFailures(() => {
                void navigate(LOGIN_ROUTE, {
                    replace: true,
                    state: { returnTo: getCurrentRelativeUrl(location), reason: 'session-expired' },
                });
            }),
        [location, navigate],
    );

    return null;
}
