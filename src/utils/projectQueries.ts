import { useLiveQuery } from '@tanstack/react-db';
import { useEffect } from 'react';
import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/api/queryKeys';
import { listProjects } from '@/features/projects/api/projectsApi';
import { projectsCollection, replaceCollectionRows } from '@/utils/dbCollections';
import type { ProjectSummary } from '@/types/domain';

/** Loads backend projects into a React DB collection for application bootstrap and sidebar rendering. */
export function useProjectsQuery() {
    const query = useQuery({
        queryKey: projectKeys.all,
        queryFn: ({ signal }) => listProjects({ signal }),
        retry: false,
    });
    const liveProjects = useLiveQuery(projectsCollection);

    useEffect(() => {
        if (query.data) replaceCollectionRows(projectsCollection, query.data);
    }, [query.data]);

    return { ...query, data: liveProjects.data as ProjectSummary[] };
}

/** Creates a project through the backend when the OpenAPI project contract is available. */
export function useCreateProjectMutation(queryClient: QueryClient) {
    return useMutation({
        mutationFn: () =>
            Promise.reject(new Error('Backend contract gap: openapi/backend-api.json does not expose POST /projects.')),
        onSuccess: async () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    });
}
