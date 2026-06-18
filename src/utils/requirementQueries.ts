import { useLiveQuery, eq } from '@tanstack/react-db';
import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { requirementKeys } from '@/api/queryKeys';
import {
    getRequirement,
    listRequirementsByProject,
    lookupRequirementByVisibleKey,
} from '@/features/requirements/api/requirementsApi';
import {
    requirementDetailsCollection,
    requirementsCollection,
    replaceCollectionRows,
    upsertCollectionRow,
} from '@/utils/dbCollections';
import type { RequirementView } from '@/types/domain';

/** Loads the active project's requirement list into a React DB collection when the backend exposes a project scope. */
export function useProjectRequirementsQuery(projectId: string | null) {
    const query = useQuery({
        queryKey: projectId ? requirementKeys.list(projectId) : requirementKeys.list('none'),
        queryFn: ({ signal }) => listRequirementsByProject(projectId ?? '', { signal }),
        enabled: Boolean(projectId),
        retry: false,
    });
    const liveRequirements = useLiveQuery(requirementsCollection);

    useEffect(() => {
        if (query.data) replaceCollectionRows(requirementsCollection, query.data);
    }, [query.data]);

    return { ...query, data: liveRequirements.data as RequirementView[] };
}

/** Loads a requirement detail by immutable backend requirement ID into a React DB collection. */
export function useRequirementDetailQuery(requirementId: string | null | undefined) {
    const query = useQuery({
        queryKey: requirementId ? requirementKeys.detail(requirementId) : requirementKeys.detail('none'),
        queryFn: ({ signal }) => getRequirement(requirementId ?? '', { signal }),
        enabled: Boolean(requirementId),
        retry: false,
    });
    const liveRequirement = useLiveQuery(
        (q) => {
            if (!requirementId) return undefined;
            return q
                .from({ requirement: requirementDetailsCollection })
                .where(({ requirement }) => eq(requirement.id, requirementId));
        },
        [requirementId],
    );

    useEffect(() => {
        if (query.data) upsertCollectionRow(requirementDetailsCollection, query.data);
    }, [query.data]);

    return { ...query, data: liveRequirement.data[0] as RequirementView | undefined };
}

/** Performs exact current visible-key lookup through the backend and stores the result in React DB. */
export function useRequirementLookupMutation() {
    return useMutation({
        mutationFn: (visibleKey: string) => lookupRequirementByVisibleKey(visibleKey.trim()),
        onSuccess: (requirement) => upsertCollectionRow(requirementDetailsCollection, requirement),
    });
}
