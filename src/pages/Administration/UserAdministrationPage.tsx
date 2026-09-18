import { useSelector } from '@tanstack/react-store';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import type { UserAdministrationResponse } from '@/api/authApi';
import type { AccountRole, UserStatus } from '@/auth/authTypes';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import { UserDetails } from '@/pages/Administration/UserDetails';
import { UserList } from '@/pages/Administration/UserList';
import { UserRoleDialog } from '@/pages/Administration/UserRoleDialog';
import { useUserAdministration } from '@/pages/Administration/useUserAdministration';
import { useUserPresence } from '@/pages/Administration/useUserPresence';
import { authStore } from '@/stores/authStore';
import {
    actionBarStore,
    clearAdministratorActionRequest,
    setAdministratorUserActionContext,
} from '@/stores/actionBarStore';
import { showToastMessage } from '@/stores/toastStore';

import '@/pages/Administration/UserAdministrationPage.scss';

type RoleDialogState = Readonly<{ user: UserAdministrationResponse; restoreActiveStatus: boolean }>;

/** Renders the Administrator user overview or one selected user's account details. */
export function UserAdministrationPage() {
    const { userId } = useParams<{ userId?: string }>();
    const currentUserId = authStore.state.user?.id;
    const administration = useUserAdministration();
    const presenceByUserId = useUserPresence(administration.users);
    const selectedUser = administration.users.find((user) => user.id === userId);
    const selectedPresence = selectedUser === undefined ? undefined : presenceByUserId.get(selectedUser.id);
    const [roleDialog, setRoleDialog] = useState<RoleDialogState>();
    const administratorActionRequest = useSelector(actionBarStore, (state) => state.administratorActionRequest);

    async function openRoleDialog(user: UserAdministrationResponse, loggedIn: boolean): Promise<void> {
        if (loggedIn) {
            showToastMessage(toastMessages.userRoleChangeBlockedByLogin(user.displayName));
            return;
        }

        if (user.status !== 'active') {
            setRoleDialog({ user, restoreActiveStatus: false });
            return;
        }

        try {
            const deactivatedUser = await administration.changeStatusAsync({
                user,
                status: 'deactivated',
                notify: false,
            });
            setRoleDialog({ user: deactivatedUser, restoreActiveStatus: true });
        } catch {
            // The administration mutation already reports the backend error through the application toast.
        }
    }

    async function closeRoleDialog(state = roleDialog): Promise<void> {
        if (state === undefined) return;

        if (state.restoreActiveStatus) {
            try {
                await administration.changeStatusAsync({ user: state.user, status: 'active', notify: false });
            } catch {
                // Keep the dialog open if restoring the account fails so the Administrator can retry or inspect the state.
                return;
            }
        }
        setRoleDialog(undefined);
    }

    async function saveRole(role: AccountRole): Promise<void> {
        if (roleDialog === undefined) return;

        try {
            const updatedUser = await administration.changeRoleAsync({ user: roleDialog.user, role });
            await closeRoleDialog({ ...roleDialog, user: updatedUser });
        } catch {
            // The role mutation reports the backend error through the application toast.
        }
    }

    function canActivate(user: UserAdministrationResponse): boolean {
        return user.emailVerifiedAt !== null && user.role !== null;
    }

    useEffect(() => {
        if (selectedUser === undefined) {
            setAdministratorUserActionContext(undefined);
            return () => setAdministratorUserActionContext(undefined);
        }

        const targetStatus: Exclude<UserStatus, 'pending'> =
            selectedUser.status === 'active' ? 'deactivated' : 'active';
        const selfDeactivationBlocked = targetStatus === 'deactivated' && selectedUser.id === currentUserId;
        const activationBlocked = targetStatus === 'active' && !canActivate(selectedUser);

        setAdministratorUserActionContext({
            label: targetStatus === 'active' ? 'Activate account' : 'Deactivate account',
            disabled:
                administration.mutationPending
                || selectedPresence?.loading === true
                || selectedPresence?.error === true
                || selfDeactivationBlocked
                || activationBlocked,
        });

        return () => setAdministratorUserActionContext(undefined);
    }, [
        administration.mutationPending,
        currentUserId,
        selectedPresence?.error,
        selectedPresence?.loading,
        selectedUser,
    ]);

    useEffect(() => {
        if (administratorActionRequest !== 'toggleUserStatus') return;
        clearAdministratorActionRequest();
        if (selectedUser === undefined) return;

        const targetStatus: Exclude<UserStatus, 'pending'> =
            selectedUser.status === 'active' ? 'deactivated' : 'active';
        administration.changeStatus({ user: selectedUser, status: targetStatus });
    }, [administratorActionRequest, administration, selectedUser]);

    return (
        <section
            className='user-administration'
            aria-labelledby='user-administration-title'>
            <header>
                <h1 id='user-administration-title'>Users &amp; Sessions</h1>
            </header>

            <LoadableContent
                loading={administration.usersLoading}
                error={administration.usersError}
                empty={administration.users.length === 0}
                loadingMessage='Loading users …'
                errorMessage='Users could not be loaded.'
                emptyMessage='No users are available.'>
                {userId === undefined ?
                    <UserList
                        users={administration.users}
                        presenceByUserId={presenceByUserId}
                        currentUserId={currentUserId}
                        pending={administration.mutationPending}
                        onOpenRoleDialog={(user, loggedIn) => void openRoleDialog(user, loggedIn)}
                        onChangeStatus={(user, status) => administration.changeStatus({ user, status })}
                        onRevokeAllSessions={administration.revokeAllSessions}
                    />
                : selectedUser === undefined ?
                    <p
                        role='alert'
                        className='user-administration__selection'>
                        The selected user could not be found.
                    </p>
                :   <UserDetails
                        user={selectedUser}
                        loggedIn={selectedPresence?.active ?? false}
                        pending={
                            administration.mutationPending
                            || selectedPresence?.loading === true
                            || selectedPresence?.error === true
                        }
                        onOpenRoleDialog={(user, loggedIn) => void openRoleDialog(user, loggedIn)}
                    />
                }
            </LoadableContent>

            <UserRoleDialog
                user={roleDialog?.user}
                visible={roleDialog !== undefined}
                pending={administration.mutationPending}
                onHide={() => void closeRoleDialog()}
                onChangeRole={saveRole}
            />
        </section>
    );
}
