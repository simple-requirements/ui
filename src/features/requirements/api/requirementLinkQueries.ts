import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import { requirementLinkKeys } from '@/api/queryKeys';
import {
    createRequirementLink,
    deleteRequirementLink,
    getRequirementLinkChanges,
    getRequirementRevisionLinks,
    listRequirementLinkHistory,
    listRequirementLinks,
    normalizeRequirementLinkTargetKey,
    updateRequirementLink,
} from '@/features/requirements/api/requirementLinksApi';

export function useRequirementLinksQuery(requirementId: string | null | undefined) {
    return useQuery({
        queryKey: requirementId ? requirementLinkKeys.current(requirementId) : requirementLinkKeys.current('none'),
        queryFn: ({ signal }) => listRequirementLinks(requirementId ?? '', { signal }),
        enabled: Boolean(requirementId),
        retry: false,
    });
}

export function useRequirementLinkHistoryQuery(requirementId: string | null | undefined) {
    return useQuery({
        queryKey: requirementId ? requirementLinkKeys.history(requirementId) : requirementLinkKeys.history('none'),
        queryFn: ({ signal }) => listRequirementLinkHistory(requirementId ?? '', { signal }),
        enabled: Boolean(requirementId),
        retry: false,
    });
}

export function useRequirementRevisionLinksQuery(
    requirementId: string | null | undefined,
    revisionNumber: number | null | undefined,
) {
    return useQuery({
        queryKey:
            requirementId && revisionNumber ?
                requirementLinkKeys.revision(requirementId, revisionNumber)
            :   requirementLinkKeys.revision('none', 0),
        queryFn: ({ signal }) => getRequirementRevisionLinks(requirementId ?? '', revisionNumber ?? 0, { signal }),
        enabled: Boolean(requirementId && revisionNumber),
        retry: false,
    });
}

export function useRequirementLinkChangesQuery(
    requirementId: string | null | undefined,
    fromRevision: number | null | undefined,
    toRevision: number | null | undefined,
) {
    return useQuery({
        queryKey:
            requirementId && fromRevision && toRevision ?
                requirementLinkKeys.changes(requirementId, fromRevision, toRevision)
            :   requirementLinkKeys.changes('none', 0, 0),
        queryFn: ({ signal }) =>
            getRequirementLinkChanges(
                requirementId ?? '',
                { fromRevision: fromRevision ?? 0, toRevision: toRevision ?? 0 },
                { signal },
            ),
        enabled: Boolean(requirementId && fromRevision && toRevision && fromRevision !== toRevision),
        retry: false,
    });
}

async function invalidateRequirementLinks(queryClient: QueryClient, requirementId: string) {
    await queryClient.invalidateQueries({ queryKey: requirementLinkKeys.all(requirementId) });
}

export function useCreateRequirementLinkMutation(queryClient: QueryClient, requirementId: string) {
    return useMutation({
        mutationFn: (targetVisibleKey: string) =>
            createRequirementLink(requirementId, {
                targetVisibleKey: normalizeRequirementLinkTargetKey(targetVisibleKey),
            }),
        onSuccess: async () => invalidateRequirementLinks(queryClient, requirementId),
    });
}

export function useUpdateRequirementLinkMutation(queryClient: QueryClient, requirementId: string) {
    return useMutation({
        mutationFn: ({ linkId, targetVisibleKey }: Readonly<{ linkId: string; targetVisibleKey: string }>) =>
            updateRequirementLink(linkId, { targetVisibleKey: normalizeRequirementLinkTargetKey(targetVisibleKey) }),
        onSuccess: async () => invalidateRequirementLinks(queryClient, requirementId),
    });
}

export function useDeleteRequirementLinkMutation(queryClient: QueryClient, requirementId: string) {
    return useMutation({
        mutationFn: (linkId: string) => deleteRequirementLink(linkId),
        onSuccess: async () => invalidateRequirementLinks(queryClient, requirementId),
    });
}
