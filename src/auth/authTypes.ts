export type UserStatus = 'pending' | 'active' | 'deactivated';

export type GlobalRole = 'administrator';

export type ProjectRole = 'requirements_engineer' | 'developer' | 'viewer';

export type AuthenticatedProjectMembership = Readonly<{ projectId: string; roles: readonly ProjectRole[] }>;

export type AuthenticatedUser = Readonly<{
    id: string;
    username: string;
    email: string;
    displayName: string;
    status: UserStatus;
    globalRoles: readonly GlobalRole[];
    projectMemberships?: readonly AuthenticatedProjectMembership[];
}>;

export type AuthenticatedSession = Readonly<{ accessToken: string; user: AuthenticatedUser }>;
