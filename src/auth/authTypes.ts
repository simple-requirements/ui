export type UserStatus = 'pending' | 'active' | 'deactivated';

export type ProjectRole = 'requirements_engineer' | 'developer' | 'viewer';

export type AccountRole = 'administrator' | ProjectRole;

export type AuthenticatedProjectMembership = Readonly<{ projectId: string }>;

export type AuthenticatedUser = Readonly<{
    id: string;
    username: string;
    email: string;
    displayName: string;
    status: UserStatus;
    role: AccountRole;
    projectMemberships?: readonly AuthenticatedProjectMembership[];
}>;

export type AuthenticatedSession = Readonly<{ accessToken: string; user: AuthenticatedUser }>;
