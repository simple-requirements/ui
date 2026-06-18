import { runOrvalFetch } from '@/api/client/config';
import { getRequirementsId, getRequirementsKeyVisibleKey } from '@/api/generated/endpoints/requirements/requirements';
import type { RequirementResponseDto } from '@/api/generated/models';
import type { RequirementView } from '@/types/domain';

function categoryKeyFromVisibleKey(visibleKey: string) {
    return visibleKey.split('-')[1] ?? '—';
}
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
export function listRequirementsByProject(projectId: string): Promise<RequirementView[]> {
    void projectId;
    return Promise.reject(
        new Error(
            'Backend contract gap: openapi/backend-api.json exposes GET /requirements but has no projectId filter. Project-scoped requirement listing is unavailable.',
        ),
    );
}
export async function getRequirement(requirementId: string, init?: RequestInit) {
    return mapRequirement(await runOrvalFetch(() => getRequirementsId(requirementId, init)));
}
export async function lookupRequirementByVisibleKey(visibleKey: string, init?: RequestInit) {
    return mapRequirement(await runOrvalFetch(() => getRequirementsKeyVisibleKey(visibleKey, init)));
}
