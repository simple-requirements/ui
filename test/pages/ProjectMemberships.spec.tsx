import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ProjectMembershipResponse, UserAdministrationResponse } from '@/api/authApi';
import { ProjectMemberships } from '@/pages/Administration/ProjectMemberships';

const alice: UserAdministrationResponse = {
    id: 'user-1',
    username: 'alice',
    email: 'alice@example.org',
    displayName: 'Alice Member',
    status: 'active',
    globalRoles: [],
    emailVerifiedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
};
const bob: UserAdministrationResponse = {
    ...alice,
    id: 'user-2',
    username: 'bob',
    email: 'bob@example.org',
    displayName: 'Bob Builder',
    globalRoles: ['administrator'],
};
const aliceMembership: ProjectMembershipResponse = {
    userId: alice.id,
    username: alice.username,
    displayName: alice.displayName,
    roles: ['viewer'],
};

afterEach(cleanup);

describe('ProjectMemberships', () => {
    it('adds memberships, changes multiple roles, and removes memberships', async () => {
        const interaction = userEvent.setup();
        const onSetMembership = vi.fn();
        const onRemoveMembership = vi.fn();
        render(
            <ProjectMemberships
                projectName='Project Alpha'
                users={[alice, bob]}
                memberships={[aliceMembership]}
                pending={false}
                onSetMembership={onSetMembership}
                onRemoveMembership={onRemoveMembership}
            />,
        );

        const aliceRow = screen.getByRole('row', { name: /Alice Member/iu });
        expect(within(aliceRow).getAllByRole('cell')[0]).toHaveTextContent('Viewer');

        const aliceRoles = within(aliceRow).getByRole('group', { name: 'Roles for Alice Member' });
        await interaction.click(within(aliceRoles).getByLabelText('Developer'));
        await interaction.click(within(aliceRow).getByRole('button', { name: 'Save roles' }));

        expect(onSetMembership).toHaveBeenCalledWith(alice.id, alice.displayName, ['developer', 'viewer']);

        const assignment = screen.getByRole('form', { name: 'Assign project membership' });
        await interaction.selectOptions(within(assignment).getByLabelText('User'), bob.id);
        const newRoles = within(assignment).getByRole('group', { name: 'Roles for new membership' });
        await interaction.click(within(newRoles).getByLabelText('Requirements Engineer'));
        await interaction.click(within(newRoles).getByLabelText('Developer'));
        await interaction.click(within(assignment).getByRole('button', { name: 'Add membership' }));

        expect(onSetMembership).toHaveBeenLastCalledWith(bob.id, bob.displayName, [
            'requirements_engineer',
            'developer',
        ]);

        await interaction.click(within(aliceRow).getByRole('button', { name: 'Remove membership' }));
        expect(onRemoveMembership).toHaveBeenCalledWith(alice.id, alice.displayName);
    });

    it('requires at least one role before a membership can be saved', async () => {
        const interaction = userEvent.setup();
        render(
            <ProjectMemberships
                projectName='Project Alpha'
                users={[alice, bob]}
                memberships={[aliceMembership]}
                pending={false}
                onSetMembership={vi.fn()}
                onRemoveMembership={vi.fn()}
            />,
        );

        const assignment = screen.getByRole('form', { name: 'Assign project membership' });
        await interaction.selectOptions(within(assignment).getByLabelText('User'), bob.id);
        expect(within(assignment).getByRole('button', { name: 'Add membership' })).toBeDisabled();

        const aliceRow = screen.getByRole('row', { name: /Alice Member/iu });
        const aliceRoles = within(aliceRow).getByRole('group', { name: 'Roles for Alice Member' });
        await interaction.click(within(aliceRoles).getByLabelText('Viewer'));
        expect(within(aliceRow).getByRole('button', { name: 'Save roles' })).toBeDisabled();
    });
});
