import { useId, useState, type FormEvent } from 'react';

import type { UserAdministrationResponse } from '@/api/authApi';
import type { ProjectRole } from '@/auth/authTypes';
import { isAdministrator } from '@/auth/globalPermissions';
import { normalizeProjectRoles, projectRoleOptions, projectRolesFromValues } from '@/auth/projectRoleMetadata';

import type { SetProjectMembershipHandler } from '@/pages/Administration/ProjectMemberships/types';

type AssignmentFormProps = Readonly<{
    users: readonly UserAdministrationResponse[];
    availableUsers: readonly UserAdministrationResponse[];
    pending: boolean;
    onSetMembership: SetProjectMembershipHandler;
}>;

export function AssignmentForm({ users, availableUsers, pending, onSetMembership }: AssignmentFormProps) {
    const userSelectId = useId();
    const roleSelectionId = useId();
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<ProjectRole[]>([]);
    const controlsDisabled = pending || availableUsers.length === 0;
    const addDisabled = controlsDisabled || selectedUserId.length === 0 || selectedRoles.length === 0;

    function toggleSelectedRole(role: ProjectRole): void {
        setSelectedRoles((currentRoles) =>
            normalizeProjectRoles(
                currentRoles.includes(role) ?
                    currentRoles.filter((candidate) => candidate !== role)
                :   [...currentRoles, role],
            ),
        );
    }

    function addMembership(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const userId = formData.get('userId');
        const user = typeof userId === 'string' ? users.find((candidate) => candidate.id === userId) : undefined;
        const roles = projectRolesFromValues(formData.getAll('roles'));

        if (user === undefined || roles.length === 0) {
            return;
        }

        onSetMembership(user.id, user.displayName, roles);
        setSelectedUserId('');
        setSelectedRoles([]);
    }

    return (
        <form
            className='project-memberships__assignment'
            aria-label='Assign project membership'
            onSubmit={addMembership}>
            <div className='project-memberships__user-select'>
                <label htmlFor={userSelectId}>User</label>
                <select
                    id={userSelectId}
                    name='userId'
                    value={selectedUserId}
                    disabled={controlsDisabled}
                    onChange={(event) => setSelectedUserId(event.currentTarget.value)}>
                    <option value=''>Select a user</option>
                    {availableUsers.map((user) => (
                        <option
                            key={user.id}
                            value={user.id}>
                            {user.displayName} (@{user.username}) — {user.status}
                            {isAdministrator(user) ? ' — Administrator' : ''}
                        </option>
                    ))}
                </select>
            </div>
            <fieldset
                className='project-memberships__roles'
                disabled={controlsDisabled}>
                <legend>Roles for new membership</legend>
                {projectRoleOptions.map((option) => {
                    const inputId = `${roleSelectionId}-${option.value}`;

                    return (
                        <label
                            key={option.value}
                            htmlFor={inputId}>
                            <input
                                id={inputId}
                                name='roles'
                                type='checkbox'
                                value={option.value}
                                checked={selectedRoles.includes(option.value)}
                                onChange={() => toggleSelectedRole(option.value)}
                            />
                            {option.label}
                        </label>
                    );
                })}
            </fieldset>
            <button
                type='submit'
                className='p-button p-component'
                disabled={addDisabled}>
                <span className='p-button-label'>Add membership</span>
            </button>
            {availableUsers.length === 0 && (
                <p className='project-memberships__hint'>
                    {users.length === 0 ?
                        'No registered users are available.'
                    :   'Every registered user already has a membership in this project.'}
                </p>
            )}
        </form>
    );
}
