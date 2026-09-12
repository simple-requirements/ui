import type { ProjectMembershipResponse, UserAdministrationResponse } from '@/api/authApi';
import type { ProjectRole } from '@/auth/authTypes';

export type SetProjectMembershipHandler = (userId: string, displayName: string, roles: readonly ProjectRole[]) => void;

export type RemoveProjectMembershipHandler = (userId: string, displayName: string) => void;

export type ProjectMembershipsProps = Readonly<{
    projectName: string;
    users: readonly UserAdministrationResponse[];
    memberships: readonly ProjectMembershipResponse[];
    pending: boolean;
    onSetMembership: SetProjectMembershipHandler;
    onRemoveMembership: RemoveProjectMembershipHandler;
}>;
