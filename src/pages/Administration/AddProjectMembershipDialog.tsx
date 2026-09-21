import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useEffect, useState } from 'react';

import type { UserAdministrationResponse } from '@/api/authApi';
import { projectRoleLabel } from '@/auth/projectRoleMetadata';

import '@/pages/Administration/AddProjectMembershipDialog.scss';

export type AddProjectMembershipDialogProps = Readonly<{
    visible: boolean;
    users: readonly UserAdministrationResponse[];
    pending: boolean;
    onHide: () => void;
    onAdd: (userId: string) => void | Promise<void>;
}>;

/** Selects one eligible project-scoped account and adds it to the current project. */
export function AddProjectMembershipDialog({
    visible,
    users,
    pending,
    onHide,
    onAdd,
}: AddProjectMembershipDialogProps) {
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        if (visible) setSelectedUserId('');
    }, [visible]);

    async function submit(): Promise<void> {
        if (selectedUserId.length === 0) return;
        await onAdd(selectedUserId);
        onHide();
    }

    return (
        <Dialog
            visible={visible}
            modal
            dismissableMask={false}
            closable={!pending}
            closeOnEscape={!pending}
            draggable={false}
            resizable={false}
            header={<h2 className='add-membership-dialog__heading ui-dialog__heading'>Add membership</h2>}
            pt={{
                root: { className: 'add-membership-dialog ui-dialog' },
                header: { className: 'add-membership-dialog__header ui-dialog__header' },
                content: { className: 'add-membership-dialog__content ui-dialog__content' },
            }}
            onHide={onHide}>
            <form
                className='add-membership-dialog__form ui-form--dialog ui-form--dialog-spacious'
                onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                }}>
                <div className='add-membership-dialog__field ui-field--dialog'>
                    <label
                        className='add-membership-dialog__label ui-label'
                        htmlFor='administrator-project-member'>
                        User
                    </label>
                    <select
                        className='add-membership-dialog__select ui-control ui-control--dialog'
                        id='administrator-project-member'
                        value={selectedUserId}
                        disabled={pending || users.length === 0}
                        onChange={(event) => setSelectedUserId(event.currentTarget.value)}>
                        <option value=''>Select a user</option>
                        {users.map((user) => (
                            <option
                                key={user.id}
                                value={user.id}>
                                {user.displayName} (@{user.username}) —{' '}
                                {projectRoleLabel(user.role as 'requirements_engineer' | 'developer' | 'viewer')}
                            </option>
                        ))}
                    </select>
                </div>
                {users.length === 0 && (
                    <p className='add-membership-dialog__message ui-dialog__message'>
                        No eligible users are available.
                    </p>
                )}
                <div className='add-membership-dialog__actions ui-dialog__actions ui-dialog__actions--flush'>
                    <Button
                        type='button'
                        label='Cancel'
                        disabled={pending}
                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                        onClick={onHide}
                    />
                    <Button
                        type='submit'
                        label='Add membership'
                        icon='pi pi-user-plus'
                        disabled={pending || selectedUserId.length === 0}
                        pt={{
                            root: { className: 'ui-button ui-button--primary ui-button--dialog ui-button--with-icon' },
                        }}
                    />
                </div>
            </form>
        </Dialog>
    );
}
