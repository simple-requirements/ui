import { useSelector } from '@tanstack/react-store';
import { Navigate, Outlet } from 'react-router';

import { isAdministrator } from '@/auth/globalPermissions';
import { authStore } from '@/stores/authStore';

/**
 * Restricts nested routes to the dedicated Administrator account role.
 * @returns Nested Administrator route content or a workspace redirect.
 */
export function AdministratorRoute() {
    const user = useSelector(authStore, (state) => state.user);

    return isAdministrator(user) ?
            <Outlet />
        :   <Navigate
                to='/'
                replace
            />;
}
