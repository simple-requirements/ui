import type { QueryClient } from '@tanstack/react-query';
import type { CreateRequirementDto, RequirementResponseDto, UpdateRequirementDto } from '@/api/generated/models';
import {
    PatchRequirementsIdBody,
    PatchRequirementsIdResponse,
    PostRequirementsBody,
    PostRequirementsResponse,
} from '@/api/generated/zod/requirements/requirements.zod';
import { apiFetch } from '@/api/client/config';
import { projectKeys, requirementKeys } from '@/api/queryKeys';
import { mapRequirement } from '@/features/requirements/api/requirementsApi';
import { requirementDetailsCollection, requirementsCollection, upsertCollectionRow } from '@/utils/dbCollections';
import type { Category, RequirementStatus, RequirementView } from '@/types/domain';

export interface RequirementFormValues {
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

export const toCreateRequirementRequest = (values: RequirementFormValues): CreateRequirementDto =>
    PostRequirementsBody.parse({
        categoryId: values.categoryId,
        description: values.description,
        priority: values.priority,
        owner: normalizeOptionalText(values.owner),
        rationale: normalizeOptionalText(values.rationale),
        source: normalizeOptionalText(values.source),
    });

export const toUpdateRequirementRequest = (values: Omit<RequirementFormValues, 'categoryId'>): UpdateRequirementDto =>
    PatchRequirementsIdBody.parse({
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

export const validateRequirementResponse = (dto: RequirementResponseDto, operation: 'create' | 'update') =>
    (operation === 'create' ? PostRequirementsResponse : PatchRequirementsIdResponse).parse(
        dto,
    ) as RequirementResponseDto;

export const createRequirement = async (values: RequirementFormValues) =>
    mapRequirement(
        validateRequirementResponse(
            await apiFetch<RequirementResponseDto>('/requirements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toCreateRequirementRequest(values)),
            }),
            'create',
        ),
    );

export const updateRequirement = async (requirementId: string, values: Omit<RequirementFormValues, 'categoryId'>) =>
    mapRequirement(
        validateRequirementResponse(
            await apiFetch<RequirementResponseDto>(`/requirements/${encodeURIComponent(requirementId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toUpdateRequirementRequest(values)),
            }),
            'update',
        ),
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
