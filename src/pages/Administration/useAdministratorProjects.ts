import { useMutation, useQuery } from '@tanstack/react-query';

import {
    createAdministratorProject,
    deleteAdministratorProject,
    listAdministratorProjects,
    updateAdministratorProject,
} from '@/api/adminProjectsApi';
import { listUsers, removeProjectMembership, setProjectMembership } from '@/api/authApi';
import { queryClient } from '@/api/queryClient';
import {
    administrationProjectsQueryKey,
    administrationUsersQueryKey,
} from '@/pages/Administration/administrationQueryKeys';

async function refreshProjects(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: administrationProjectsQueryKey });
}

/**
 * Orchestrates Administrator project CRUD, settings, and membership changes.
 */
export function useAdministratorProjects() {
    const projectsQuery = useQuery({ queryKey: administrationProjectsQueryKey, queryFn: listAdministratorProjects });
    const usersQuery = useQuery({
        queryKey: administrationUsersQueryKey,
        queryFn: async () => (await listUsers()).data,
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => createAdministratorProject(name),
        onSuccess: refreshProjects,
    });
    const updateMutation = useMutation({
        mutationFn: ({
            projectId,
            data,
        }: Readonly<{ projectId: string; data: Readonly<{ name?: string; ticketUrlTemplate?: string | null }> }>) =>
            updateAdministratorProject(projectId, data),
        onSuccess: refreshProjects,
    });
    const deleteMutation = useMutation({ mutationFn: deleteAdministratorProject, onSuccess: refreshProjects });
    const addMembershipMutation = useMutation({
        mutationFn: ({ projectId, userId }: Readonly<{ projectId: string; userId: string }>) =>
            setProjectMembership(projectId, userId),
        onSuccess: refreshProjects,
    });
    const removeMembershipMutation = useMutation({
        mutationFn: ({ projectId, userId }: Readonly<{ projectId: string; userId: string }>) =>
            removeProjectMembership(projectId, userId),
        onSuccess: refreshProjects,
    });

    return {
        projects: projectsQuery.data ?? [],
        projectsLoading: projectsQuery.isLoading,
        projectsError: projectsQuery.isError,
        users: usersQuery.data ?? [],
        usersLoading: usersQuery.isLoading,
        usersError: usersQuery.isError,
        createProject: createMutation.mutateAsync,
        updateProject: updateMutation.mutateAsync,
        deleteProject: deleteMutation.mutateAsync,
        addMembership: addMembershipMutation.mutateAsync,
        removeMembership: removeMembershipMutation.mutateAsync,
        mutationPending:
            createMutation.isPending
            || updateMutation.isPending
            || deleteMutation.isPending
            || addMembershipMutation.isPending
            || removeMembershipMutation.isPending,
        mutationError:
            createMutation.isError
            || updateMutation.isError
            || deleteMutation.isError
            || addMembershipMutation.isError
            || removeMembershipMutation.isError,
    };
}
