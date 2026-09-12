import type { ProjectMembershipResponse, UserAdministrationResponse } from '@/api/authApi';

import { MembershipRow } from '@/pages/Administration/ProjectMemberships/MembershipRow';
import type {
    RemoveProjectMembershipHandler,
    SetProjectMembershipHandler,
} from '@/pages/Administration/ProjectMemberships/types';

type MembershipTableProps = Readonly<{
    projectName: string;
    users: readonly UserAdministrationResponse[];
    memberships: readonly ProjectMembershipResponse[];
    pending: boolean;
    onSetMembership: SetProjectMembershipHandler;
    onRemoveMembership: RemoveProjectMembershipHandler;
}>;

export function MembershipTable({
    projectName,
    users,
    memberships,
    pending,
    onSetMembership,
    onRemoveMembership,
}: MembershipTableProps) {
    if (memberships.length === 0) {
        return <p className='project-memberships__empty'>This project has no memberships yet.</p>;
    }

    return (
        <table className='project-memberships__table'>
            <caption>Memberships for {projectName}</caption>
            <thead>
                <tr>
                    <th scope='col'>User</th>
                    <th scope='col'>Current roles</th>
                    <th scope='col'>Change roles</th>
                    <th scope='col'>Actions</th>
                </tr>
            </thead>
            <tbody>
                {memberships.map((membership) => (
                    <MembershipRow
                        key={membership.userId}
                        membership={membership}
                        user={users.find((user) => user.id === membership.userId)}
                        pending={pending}
                        onSetMembership={onSetMembership}
                        onRemoveMembership={onRemoveMembership}
                    />
                ))}
            </tbody>
        </table>
    );
}
