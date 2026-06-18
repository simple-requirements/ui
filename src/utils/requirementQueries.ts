import { useMutation, useQuery } from '@tanstack/react-query';
import { requirementKeys } from '@/api/queryKeys';
import {
    getRequirement,
    listRequirementsByProject,
    lookupRequirementByVisibleKey,
} from '@/features/requirements/api/requirementsApi';

/** Loads the active project's requirement list when the backend exposes a project-scoped contract. */
export function useProjectRequirementsQuery(projectId: string | null) {
    return useQuery({
        queryKey: projectId ? requirementKeys.list(projectId) : requirementKeys.list('none'),
        queryFn: ({ signal }) => listRequirementsByProject(projectId ?? '', { signal }),
        enabled: Boolean(projectId),
        retry: false,
    });
}

/** Loads a requirement detail by immutable backend requirement ID. */
export function useRequirementDetailQuery(requirementId: string | null | undefined) {
    return useQuery({
        queryKey: requirementId ? requirementKeys.detail(requirementId) : requirementKeys.detail('none'),
        queryFn: ({ signal }) => getRequirement(requirementId ?? '', { signal }),
        enabled: Boolean(requirementId),
        retry: false,
    });
}

/** Performs exact current visible-key lookup through the backend. */
export function useRequirementLookupMutation() {
    return useMutation({ mutationFn: (visibleKey: string) => lookupRequirementByVisibleKey(visibleKey.trim()) });
}
