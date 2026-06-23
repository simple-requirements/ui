import { useMutation, type QueryClient } from '@tanstack/react-query';
import { projectKeys, requirementKeys } from '@/api/queryKeys';
import {
    approveRequirement,
    deleteRequirement,
    markRequirementImplemented,
    markRequirementObsolete,
    rejectRequirement,
} from '@/features/requirements/api/requirementsApi';
import { invalidateRequirementRevisionHistory } from '@/features/requirements/revisions';
import { requirementsCollection, upsertCollectionRow } from '@/state/dbCollections';
import type { RequirementView } from '@/types/domain';

export type RequirementLifecycleCommand = 'approve' | 'reject' | 'markImplemented' | 'markObsolete' | 'delete';

export type RequirementLifecycleMutationInput =
    | Readonly<{ command: 'approve' | 'markImplemented'; requirement: RequirementView }>
    | Readonly<{ command: 'reject'; requirement: RequirementView; rejectionReason: string; reviewer: string }>
    | Readonly<{ command: 'markObsolete'; requirement: RequirementView; obsolescenceReason: string }>
    | Readonly<{ command: 'delete'; requirement: RequirementView }>;

type RequirementLifecycleMutationResult =
    | Readonly<{ kind: 'updated'; requirement: RequirementView }>
    | Readonly<{ kind: 'deleted'; requirementId: string; projectId: string | null; visibleKey: string }>;

const trimRequired = (value: string, message: string) => {
    const trimmed = value.trim();
    if (!trimmed) throw new Error(message);
    return trimmed;
};

async function runLifecycleCommand(
    input: RequirementLifecycleMutationInput,
): Promise<RequirementLifecycleMutationResult> {
    if (input.command === 'approve') {
        return { kind: 'updated', requirement: await approveRequirement(input.requirement.id) };
    }

    if (input.command === 'reject') {
        return {
            kind: 'updated',
            requirement: await rejectRequirement(input.requirement.id, {
                rejectionReason: trimRequired(input.rejectionReason, 'Enter a rejection reason.'),
                reviewer: trimRequired(input.reviewer, 'Enter a reviewer.'),
            }),
        };
    }

    if (input.command === 'markImplemented') {
        return { kind: 'updated', requirement: await markRequirementImplemented(input.requirement.id) };
    }

    if (input.command === 'markObsolete') {
        return {
            kind: 'updated',
            requirement: await markRequirementObsolete(input.requirement.id, {
                obsolescenceReason: trimRequired(input.obsolescenceReason, 'Enter an obsolescence reason.'),
            }),
        };
    }

    await deleteRequirement(input.requirement.id);
    return {
        kind: 'deleted',
        requirementId: input.requirement.id,
        projectId: input.requirement.projectId,
        visibleKey: input.requirement.visibleKey,
    };
}

/** Performs lifecycle transitions and keeps requirement caches in sync. */
export function useRequirementLifecycleMutation({
    queryClient,
    onDeleted,
    onUpdated,
}: {
    queryClient: QueryClient;
    onDeleted: (requirementId: string) => void;
    onUpdated?: (requirement: RequirementView) => void;
}) {
    return useMutation({
        mutationFn: (input: RequirementLifecycleMutationInput) => runLifecycleCommand(input),
        onSuccess: async (result) => {
            if (result.kind === 'updated') {
                upsertCollectionRow(requirementsCollection, result.requirement);
                queryClient.setQueryData(requirementKeys.detail(result.requirement.id), result.requirement);
                queryClient.setQueryData(requirementKeys.byVisibleKey(result.requirement.visibleKey), result.requirement);
                if (result.requirement.projectId)
                    await queryClient.invalidateQueries({ queryKey: requirementKeys.list(result.requirement.projectId) });
                await invalidateRequirementRevisionHistory(queryClient, result.requirement.id);
                await queryClient.invalidateQueries({ queryKey: projectKeys.all });
                onUpdated?.(result.requirement);
                return;
            }

            requirementsCollection.delete(result.requirementId);
            queryClient.removeQueries({ queryKey: requirementKeys.detail(result.requirementId) });
            queryClient.removeQueries({ queryKey: requirementKeys.byVisibleKey(result.visibleKey) });
            if (result.projectId) await queryClient.invalidateQueries({ queryKey: requirementKeys.list(result.projectId) });
            await queryClient.invalidateQueries({ queryKey: projectKeys.all });
            onDeleted(result.requirementId);
        },
    });
}
