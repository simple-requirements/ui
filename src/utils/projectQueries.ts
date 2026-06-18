import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/api/queryKeys';
import { listProjects } from '@/features/projects/api/projectsApi';

/** Loads backend projects for application bootstrap and sidebar rendering. */
export function useProjectsQuery() {
    return useQuery({ queryKey: projectKeys.all, queryFn: ({ signal }) => listProjects({ signal }), retry: false });
}

/** Creates a project through the backend when the OpenAPI project contract is available. */
export function useCreateProjectMutation(queryClient: QueryClient) {
    return useMutation({
        mutationFn: () =>
            Promise.reject(new Error('Backend contract gap: openapi/backend-api.json does not expose POST /projects.')),
        onSuccess: async () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    });
}
