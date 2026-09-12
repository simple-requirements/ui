export const administrationProjectsQueryKey = ['administration', 'projects'] as const;
export const administrationUsersQueryKey = ['administration', 'users'] as const;

export function projectMembershipsQueryKey(projectId: string | undefined) {
    return ['administration', 'projects', projectId, 'memberships'] as const;
}
