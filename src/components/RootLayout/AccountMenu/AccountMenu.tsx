import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { logout } from '@/api/authApi';
import { clearUserScopedState } from '@/auth/authenticationFailure';
import { LOGIN_ROUTE, USER_ADMINISTRATION_ROUTE } from '@/auth/authRoutes';
import type { AuthenticatedUser } from '@/auth/authTypes';
import { isAdministrator } from '@/auth/globalPermissions';
import { authStore } from '@/stores/authStore';

import '@/components/RootLayout/AccountMenu/AccountMenu.scss';

const ACCOUNT_MENU_ID = 'account-menu-popup';

/**
 * Builds the accessible username text shown below the display name.
 * @param user Authenticated user shown by the account menu.
 * @returns Username label prefixed with an at sign.
 */
function usernameLabel(user: AuthenticatedUser): string {
    return `@${user.username}`;
}

/**
 * Shows the authenticated account menu inside the application action bar.
 * @returns Account menu button and popup for the current user.
 */
export function AccountMenu() {
    const user = useSelector(authStore, (state) => state.user);
    const [pending, setPending] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const canOpenAdministration = useMemo(() => user !== undefined && isAdministrator(user), [user]);

    /**
     * Opens or closes the account menu popup.
     * @returns Nothing.
     */
    function toggleMenu(): void {
        setOpen((currentOpen) => !currentOpen);
    }

    /**
     * Navigates to user administration and closes the account menu.
     * @returns Nothing.
     */
    function openAdministration(): void {
        setOpen(false);
        void navigate(USER_ADMINISTRATION_ROUTE);
    }

    /**
     * Ends the backend session, clears local user state and returns to login.
     * @returns Promise that resolves after local logout cleanup has completed.
     */
    async function handleLogout(): Promise<void> {
        if (pending) {
            return;
        }

        setPending(true);

        try {
            await logout();
        } catch {
            // Local logout must still complete when the session already expired or the API is unavailable.
        } finally {
            setOpen(false);
            clearUserScopedState();
            void navigate(LOGIN_ROUTE, { replace: true });
        }
    }

    if (user === undefined) {
        return null;
    }

    return (
        <div
            className='account-menu'
            aria-label='Current user'>
            <Button
                type='button'
                icon='pi pi-cog'
                aria-label='Account menu'
                aria-haspopup='menu'
                aria-controls={ACCOUNT_MENU_ID}
                aria-expanded={open}
                loading={pending}
                onClick={toggleMenu}
                pt={{ root: { className: 'account-menu__button' } }}
            />
            {open ?
                <div
                    id={ACCOUNT_MENU_ID}
                    role='menu'
                    className='account-menu__popup'>
                    <div
                        className='account-menu__summary'
                        aria-label='Signed in user'>
                        <strong>{user.displayName}</strong>
                        <small>{usernameLabel(user)}</small>
                    </div>
                    {canOpenAdministration ?
                        <button
                            type='button'
                            role='menuitem'
                            className='account-menu__item'
                            onClick={openAdministration}>
                            <span
                                className='pi pi-users'
                                aria-hidden='true'
                            />
                            Administration
                        </button>
                    :   null}
                    <div className='account-menu__separator' />
                    <button
                        type='button'
                        role='menuitem'
                        className='account-menu__item'
                        disabled={pending}
                        onClick={() => void handleLogout()}>
                        <span
                            className='pi pi-sign-out'
                            aria-hidden='true'
                        />
                        Logout
                    </button>
                </div>
            :   null}
        </div>
    );
}
