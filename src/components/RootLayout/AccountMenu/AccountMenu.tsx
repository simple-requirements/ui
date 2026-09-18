import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { logout } from '@/api/authApi';
import { clearUserScopedState } from '@/auth/authenticationFailure';
import { LOGIN_ROUTE } from '@/auth/authRoutes';
import type { AuthenticatedUser } from '@/auth/authTypes';
import { authStore } from '@/stores/authStore';

import '@/components/RootLayout/AccountMenu/AccountMenu.scss';

const ACCOUNT_MENU_ID = 'account-menu-popup';

function usernameLabel(user: AuthenticatedUser): string {
    return `@${user.username}`;
}

/** Shows account identity and account-scoped actions for the signed-in user. */
export function AccountMenu() {
    const user = useSelector(authStore, (state) => state.user);
    const [pending, setPending] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    function toggleMenu(): void {
        setOpen((currentOpen) => !currentOpen);
    }

    async function handleLogout(): Promise<void> {
        setPending(true);

        try {
            await logout();
        } catch {
            // Local logout must still complete when the session is already invalid or the network is unavailable.
        } finally {
            clearUserScopedState();
            setOpen(false);
            setPending(false);
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
                pt={{ root: { className: 'ui-button ui-button--ghost ui-button--icon-only account-menu__button' } }}
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
