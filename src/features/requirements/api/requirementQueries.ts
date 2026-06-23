import { useLiveQuery, eq } from '@tanstack/react-db';
import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { requirementKeys } from '@/api/queryKeys';
import {
    getRequirement,
    listRequirementsByProject,
    lookupRequirementByVisibleKey,
} from '@/features/requirements/api/requirementsApi';
import { requirementsCollection, replaceProjectRequirementRows, upsertCollectionRow } from '@/state/dbCollections';
import type { RequirementView } from '@/types/domain';

export const requirementDetailFromLiveRows = (
    liveRows: readonly RequirementView[] | undefined,
    queryData: RequirementView | undefined,
) => liveRows?.[0] ?? queryData;

/** Loads one project's requirement list into the canonical React DB requirement collection. */
export function useProjectRequirementsQuery(projectId: string | null) {
    const query = useQuery({
        queryKey: projectId ? requirementKeys.list(projectId) : requirementKeys.list('none'),
        queryFn: ({ signal }) => listRequirementsByProject(projectId ?? '', { signal }),
        enabled: Boolean(projectId),
        retry: false,
    });
    const liveRequirements = useLiveQuery(
        (q) => {
            if (!projectId) return undefined;
            return q
                .from({ requirement: requirementsCollection })
                .where(({ requirement }) => eq(requirement.projectId, projectId));
        },
        [projectId],
    );

    useEffect(() => {
        if (projectId && query.data) replaceProjectRequirementRows(projectId, query.data);
    }, [projectId, query.data]);

    const data = liveRequirements.data as RequirementView[] | undefined;
    return { ...query, data: data ?? [] };
}

/** Loads a requirement detail by immutable backend requirement ID into the canonical React DB requirement collection. */
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
                .from({ requirement: requirementsCollection })
                .where(({ requirement }) => eq(requirement.id, requirementId));
        },
        [requirementId],
    );

    useEffect(() => {
        if (query.data) upsertCollectionRow(requirementsCollection, query.data);
    }, [query.data]);

    return { ...query, data: requirementDetailFromLiveRows(liveRequirement.data, query.data) };
}

/** Performs exact current visible-key lookup through the backend and stores the result in React DB. */
export function useRequirementLookupMutation() {
    return useMutation({
        mutationFn: (visibleKey: string) => lookupRequirementByVisibleKey(visibleKey.trim()),
        onSuccess: (requirement) => upsertCollectionRow(requirementsCollection, requirement),
    });
}
