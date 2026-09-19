import { useSelector } from '@tanstack/react-store';
import { Navigate, Outlet, useLocation } from 'react-router';

import { AuthenticationFailureNavigator } from '@/auth/AuthenticationFailureNavigator';
import { getCurrentRelativeUrl } from '@/auth/authRoutes';
import { LOGIN_ROUTE } from '@/router/authenticationRoutes';
import { authStore } from '@/stores/authStore';

export function ProtectedRoute() {
    const authenticationState = useSelector(authStore, (state) => state);
    const location = useLocation();

    if (authenticationState.status !== 'authenticated') {
        return (
            <Navigate
                to={LOGIN_ROUTE}
                replace
                state={{
                    returnTo: getCurrentRelativeUrl(location),
                    ...(authenticationState.reason === undefined ? {} : { reason: authenticationState.reason }),
                }}
            />
        );
    }

    return (
        <>
            <AuthenticationFailureNavigator />
            <Outlet />
        </>
    );
}
