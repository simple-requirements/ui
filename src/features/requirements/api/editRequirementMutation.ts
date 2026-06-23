import { useMutation, type QueryClient } from '@tanstack/react-query';
import {
    assertImmutableRequirementFields,
    isRequirementEditable,
    synchronizeRequirementFromServer,
    updateRequirement,
    type RequirementFormValues,
} from '@/features/requirements/requirementForms';
import { invalidateRequirementRevisionHistory } from '@/features/requirements/revisions';
import type { RequirementView } from '@/types/domain';

type EditRequirementValues = Omit<RequirementFormValues, 'categoryId'>;

/**
 * Owns the full draft-edit mutation lifecycle shared by split-pane and
 * dedicated-tab editors. The caller supplies a lazy current-requirement lookup
 * so the hook can validate editability at mutation time instead of capturing a
 * stale requirement snapshot.
 */
export function useEditRequirementMutation({
    queryClient,
    projectId,
    getCurrentRequirement,
    onEdited,
}: {
    queryClient: QueryClient;
    projectId: string | null;
    getCurrentRequirement: () => RequirementView | null | undefined;
    onEdited: () => void;
}) {
    return useMutation({
        mutationFn: async (values: EditRequirementValues) => {
            const current = getCurrentRequirement();
            if (!current) throw new Error('Requirement detail must load before editing.');
            if (!isRequirementEditable(current.status)) throw new Error('Only draft requirements can be edited.');
            const updated = await updateRequirement(current.id, {
                ...values,
                projectId: current.projectId ?? projectId ?? undefined,
            });
            assertImmutableRequirementFields(current, updated);
            return updated;
        },
        onSuccess: async (requirement) => {
            await synchronizeRequirementFromServer({ requirement, projectId, reason: 'updated', queryClient });
            await invalidateRequirementRevisionHistory(queryClient, requirement.id);
            onEdited();
        },
    });
}
