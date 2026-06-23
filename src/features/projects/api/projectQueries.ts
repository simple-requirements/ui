import { useLiveQuery } from '@tanstack/react-db';
import { useEffect } from 'react';
import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/api/queryKeys';
import { createProject, listProjects } from '@/features/projects/api/projectsApi';
import { projectsCollection, replaceCollectionRows } from '@/state/dbCollections';
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

    const data = liveProjects.data as ProjectSummary[] | undefined;
    return { ...query, data: data ?? [] };
}

export class ProjectCreationUnavailableError extends Error {
    constructor() {
        super('Project creation is currently unavailable.');
        this.name = 'ProjectCreationUnavailableError';
    }
}

/** Creates a project through the generated backend client. */
export function useCreateProjectMutation(queryClient: QueryClient) {
    return useMutation({
        mutationFn: (name: string) => {
            const trimmedName = name.trim();
            if (!trimmedName) return Promise.reject(new ProjectCreationUnavailableError());
            return createProject(trimmedName);
        },
        onSuccess: async () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    });
}
