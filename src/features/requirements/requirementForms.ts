import type { QueryClient } from '@tanstack/react-query';
import { runOrvalFetch } from '@/api/client/config';
import { patchRequirementsId, postRequirements } from '@/api/generated/endpoints/requirements/requirements';
import type { CreateRequirementDto, UpdateRequirementDto } from '@/api/generated/models';
import { projectKeys, requirementKeys } from '@/api/queryKeys';
import { mapRequirement } from '@/features/requirements/api/requirementsApi';
import { requirementDetailsCollection, requirementsCollection, upsertCollectionRow } from '@/utils/dbCollections';
import type { Category, RequirementStatus, RequirementView } from '@/types/domain';

export interface RequirementFormValues {
    projectId?: string;
    categoryId: string;
    description: string;
    priority: string;
    owner: string;
    rationale: string;
    source: string;
}

export const priorityOptions = ['P1', 'P2', 'P3', 'P4'] as const;

const normalizeOptionalText = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const requireProjectId = (projectId: string | undefined) => {
    const trimmed = projectId?.trim();
    if (!trimmed) throw new Error('Select a project before creating a requirement.');
    return trimmed;
};

export const toCreateRequirementRequest = (values: RequirementFormValues): CreateRequirementDto => ({
    projectId: requireProjectId(values.projectId),
    categoryId: values.categoryId,
    description: values.description,
    priority: values.priority,
    owner: normalizeOptionalText(values.owner),
    rationale: normalizeOptionalText(values.rationale),
    source: normalizeOptionalText(values.source),
});

export const toUpdateRequirementRequest = (
    values: Omit<RequirementFormValues, 'categoryId'>,
): UpdateRequirementDto => ({
    description: values.description,
    priority: values.priority,
    owner: normalizeOptionalText(values.owner),
    rationale: normalizeOptionalText(values.rationale),
    source: normalizeOptionalText(values.source),
});

export const categoryOptionLabel = (category: Category) => `${category.key} — ${category.name} — ${category.type}`;
export const isRequirementEditable = (status: RequirementStatus | undefined) => status === 'draft';

export const assertImmutableRequirementFields = (before: RequirementView, after: RequirementView) => {
    const changed = [
        ['id', before.id, after.id],
        ['project', before.projectId, after.projectId],
        ['category', before.categoryId, after.categoryId],
        ['visible key', before.visibleKey, after.visibleKey],
        ['type', before.type, after.type],
        ['status', before.status, after.status],
    ].filter(([, left, right]) => left !== right);
    if (changed.length > 0)
        throw new Error(
            `Unexpected server response changed immutable fields: ${changed.map(([name]) => name).join(', ')}.`,
        );
};

export const createRequirement = async (values: RequirementFormValues, init?: RequestInit) =>
    runOrvalFetch(() => postRequirements(toCreateRequirementRequest(values), init)).then(mapRequirement);

export const updateRequirement = async (
    requirementId: string,
    values: Omit<RequirementFormValues, 'categoryId'>,
    init?: RequestInit,
) =>
    runOrvalFetch(() => patchRequirementsId(requirementId, toUpdateRequirementRequest(values), init)).then(
        mapRequirement,
    );

export const synchronizeRequirementFromServer = async ({
    requirement,
    projectId,
    reason,
    queryClient,
}: {
    requirement: RequirementView;
    projectId: string | null;
    reason: 'created' | 'updated';
    queryClient: QueryClient;
}) => {
    if (projectId && requirement.projectId && requirement.projectId !== projectId) {
        throw new Error('The server returned a requirement for a different project.');
    }
    upsertCollectionRow(requirementsCollection, requirement);
    upsertCollectionRow(requirementDetailsCollection, requirement);
    queryClient.setQueryData(requirementKeys.detail(requirement.id), requirement);
    queryClient.setQueryData(requirementKeys.byVisibleKey(requirement.visibleKey), requirement);
    if (projectId) await queryClient.invalidateQueries({ queryKey: requirementKeys.list(projectId) });
    if (reason === 'created') await queryClient.invalidateQueries({ queryKey: projectKeys.all });
};
