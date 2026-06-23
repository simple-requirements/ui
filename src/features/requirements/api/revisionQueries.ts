import { useQuery } from '@tanstack/react-query';
import { requirementRevisionKeys } from '@/api/queryKeys';
import { getRequirementRevision, listRequirementRevisions } from '@/features/requirements/revisions';

/** Loads immutable revision snapshots for one requirement. */
export function useRequirementRevisionsQuery(requirementId: string | null | undefined) {
    return useQuery({
        queryKey: requirementId ? requirementRevisionKeys.list(requirementId) : requirementRevisionKeys.list('none'),
        queryFn: ({ signal }) => listRequirementRevisions(requirementId ?? '', { signal }),
        enabled: Boolean(requirementId),
        retry: false,
    });
}

/** Loads one immutable revision snapshot for detail and comparison views. */
export function useRequirementRevisionDetailQuery(
    requirementId: string | null | undefined,
    revisionNumber: number | null | undefined,
) {
    return useQuery({
        queryKey:
            requirementId && revisionNumber ?
                requirementRevisionKeys.detail(requirementId, revisionNumber)
            :   requirementRevisionKeys.detail('none', 0),
        queryFn: ({ signal }) => getRequirementRevision(requirementId ?? '', revisionNumber ?? 0, { signal }),
        enabled: Boolean(requirementId && revisionNumber),
        retry: false,
    });
}
