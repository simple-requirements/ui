import { apiFetch } from '@/api/client/config';
import type { RequirementResponseDto } from '@/api/generated/models';
import type { RequirementView } from '@/types/domain';

function categoryKeyFromVisibleKey(visibleKey: string) {
    return visibleKey.split('-')[1] ?? '—';
}

/** Maps generated requirement DTOs into the read-only UI requirement view model. */
export function mapRequirement(dto: RequirementResponseDto): RequirementView {
    const maybeProjectId = (dto as RequirementResponseDto & { projectId?: string }).projectId;
    return {
        id: dto.id,
        projectId: maybeProjectId ?? null,
        visibleKey: dto.visibleKey,
        categoryId: dto.categoryId,
        categoryKey: categoryKeyFromVisibleKey(dto.visibleKey),
        categoryName: dto.categoryId,
        type: dto.type,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        owner: dto.owner,
        rationale: dto.rationale,
        source: dto.source,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

/** Reports the current OpenAPI gap instead of faking project-scoped requirement lists. */
export function listRequirementsByProject(projectId: string): Promise<RequirementView[]> {
    void projectId;
    return Promise.reject(
        new Error(
            'Backend contract gap: openapi/backend-api.json exposes GET /requirements but has no projectId filter. Project-scoped requirement listing is unavailable.',
        ),
    );
}

/** Loads one requirement detail by immutable backend ID. */
export async function getRequirement(requirementId: string, init?: RequestInit) {
    return mapRequirement(
        await apiFetch<RequirementResponseDto>(`/requirements/${encodeURIComponent(requirementId)}`, {
            ...init,
            method: 'GET',
        }),
    );
}

/** Performs exact visible-key lookup with the backend endpoint from the OpenAPI contract. */
export async function lookupRequirementByVisibleKey(visibleKey: string, init?: RequestInit) {
    return mapRequirement(
        await apiFetch<RequirementResponseDto>(`/requirements/key/${encodeURIComponent(visibleKey)}`, {
            ...init,
            method: 'GET',
        }),
    );
}
