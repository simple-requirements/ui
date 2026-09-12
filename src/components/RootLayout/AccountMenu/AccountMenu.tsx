import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { logout } from '@/api/authApi';
import { clearUserScopedState } from '@/auth/authenticationFailure';
import { LOGIN_ROUTE, USER_ADMINISTRATION_ROUTE } from '@/auth/authRoutes';
import { isAdministrator } from '@/auth/globalPermissions';
import type { AuthenticatedUser } from '@/auth/authTypes';
import { authStore } from '@/stores/authStore';

import '@/components/RootLayout/AccountMenu/AccountMenu.scss';

const ACCOUNT_MENU_ID = 'account-menu-popup';

/**
 * Builds the non-interactive menu header for the authenticated user.
 * @param user Authenticated user shown at the top of the account menu.
 * @returns Menu item that renders the user's display name and username.
 */
function createUserSummaryItem(user: AuthenticatedUser): MenuItem {
    return {
        template: () => (
            <div
                className='account-menu__summary'
                aria-label='Signed in user'>
                <strong>{user.displayName}</strong>
                <small>@{user.username}</small>
            </div>
        ),
    };
}

/**
 * Shows the authenticated account menu inside the application action bar.
 * @returns Account menu button and popup for the current user.
 */
export function AccountMenu() {
    const user = useSelector(authStore, (state) => state.user);
    const [pending, setPending] = useState(false);
    const menuRef = useRef<Menu>(null);
    const navigate = useNavigate();

    /**
     * Opens or closes the popup menu from the cog wheel button.
     * @param event Mouse event produced by the account menu button.
     */
    function toggleMenu(event: MouseEvent<HTMLButtonElement>): void {
        menuRef.current?.toggle(event);
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
            clearUserScopedState();
            void navigate(LOGIN_ROUTE, { replace: true });
        }
    }

    const menuItems = useMemo<MenuItem[]>(() => {
        if (user === undefined) {
            return [];
        }

        return [
            createUserSummaryItem(user),
            ...(isAdministrator(user) ?
                [
                    {
                        label: 'Administration',
                        icon: 'pi pi-users',
                        command: () => void navigate(USER_ADMINISTRATION_ROUTE),
                    },
                ]
            :   []),
            { separator: true },
            { label: 'Logout', icon: 'pi pi-sign-out', disabled: pending, command: () => void handleLogout() },
        ];
    }, [navigate, pending, user]);

    if (user === undefined) {
        return null;
    }

    return (
        <div
            className='account-menu'
            aria-label='Current user'>
            <Menu
                id={ACCOUNT_MENU_ID}
                ref={menuRef}
                model={menuItems}
                popup
                className='account-menu__popup'
            />
            <Button
                type='button'
                icon='pi pi-cog'
                aria-label='Account menu'
                aria-haspopup='menu'
                aria-controls={ACCOUNT_MENU_ID}
                loading={pending}
                onClick={toggleMenu}
                pt={{ root: { className: 'account-menu__button' } }}
            />
        </div>
    );
}
