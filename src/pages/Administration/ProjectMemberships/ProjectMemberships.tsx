import { useMemo } from 'react';

import { AssignmentForm } from '@/pages/Administration/ProjectMemberships/AssignmentForm';
import { MembershipTable } from '@/pages/Administration/ProjectMemberships/MembershipTable';
import type { ProjectMembershipsProps } from '@/pages/Administration/ProjectMemberships/types';

export function ProjectMemberships({
    projectName,
    users,
    memberships,
    pending,
    onSetMembership,
    onRemoveMembership,
}: ProjectMembershipsProps) {
    const memberUserIds = useMemo(() => new Set(memberships.map((membership) => membership.userId)), [memberships]);
    const availableUsers = useMemo(() => users.filter((user) => !memberUserIds.has(user.id)), [memberUserIds, users]);

    return (
        <section
            className='project-memberships'
            aria-labelledby='project-memberships-title'>
            <header>
                <h2 id='project-memberships-title'>{projectName}</h2>
                <p>
                    Assign one or more project roles. Administrators do not need a membership for global read or
                    administration, but project mutations require a project role.
                </p>
            </header>

            <AssignmentForm
                users={users}
                availableUsers={availableUsers}
                pending={pending}
                onSetMembership={onSetMembership}
            />

            <MembershipTable
                projectName={projectName}
                users={users}
                memberships={memberships}
                pending={pending}
                onSetMembership={onSetMembership}
                onRemoveMembership={onRemoveMembership}
            />
        </section>
    );
}
