import { runOrvalFetch } from '@/api/client/config';
import {
    getRequirements,
    getRequirementsId,
    getRequirementsKeyVisibleKey,
} from '@/api/generated/endpoints/requirements/requirements';
import type { RequirementResponseDto } from '@/api/generated/models';
import type { RequirementView } from '@/types/domain';

export const visibleKeyPattern = /^(?:FR|NFR)-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{4}$/;

export function validateVisibleKey(visibleKey: string) {
    return visibleKeyPattern.test(visibleKey.trim().toUpperCase());
}

function categoryKeyFromVisibleKey(visibleKey: string) {
    return visibleKey.split('-').slice(1, -1).join('-') || '—';
}

/** Maps generated requirement DTOs into the read-only UI requirement view model. */
export function mapRequirement(dto: RequirementResponseDto): RequirementView {
    return {
        id: dto.id,
        projectId: dto.projectId,
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

/** Loads a backend-filtered, project-scoped requirement list using the generated client contract. */
export function listRequirementsByProject(projectId: string, init?: RequestInit): Promise<RequirementView[]> {
    return runOrvalFetch(() => getRequirements({ projectId }, init)).then((requirements) =>
        requirements.map(mapRequirement),
    );
}

/** Loads one requirement detail by immutable backend ID. */
export async function getRequirement(requirementId: string, init?: RequestInit) {
    return runOrvalFetch(() => getRequirementsId(requirementId, init)).then(mapRequirement);
}

/** Performs exact visible-key lookup with the backend endpoint from the OpenAPI contract. */
export async function lookupRequirementByVisibleKey(visibleKey: string, init?: RequestInit) {
    return runOrvalFetch(() => getRequirementsKeyVisibleKey(visibleKey.trim().toUpperCase(), init)).then(
        mapRequirement,
    );
}
