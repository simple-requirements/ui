import { runOrvalFetch } from '@/api/client/config';
import {
    deleteRequirementsId,
    getRequirements,
    getRequirementsId,
    getRequirementsKeyVisibleKey,
    patchRequirementsIdApprove,
    patchRequirementsIdImplemented,
    patchRequirementsIdObsolete,
    patchRequirementsIdReject,
} from '@/api/generated/endpoints/requirements/requirements';
import type { MarkObsoleteRequirementDto, RejectRequirementDto, RequirementResponseDto } from '@/api/generated/models';
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
    const categoryKey = categoryKeyFromVisibleKey(dto.visibleKey);

    return {
        id: dto.id,
        projectId: dto.projectId,
        visibleKey: dto.visibleKey,
        categoryId: dto.categoryId,
        categoryKey,
        categoryName: categoryKey,
        type: dto.type,
        description: dto.description,
        renderedDescription: dto.renderedDescription,
        metricReferences: dto.metricReferences.map((metric) => ({
            id: metric.id,
            key: metric.key,
            value: metric.value,
            description: metric.description,
            resolved: metric.resolved,
        })),
        priority: dto.priority,
        status: dto.status,
        owner: dto.owner,
        rationale: dto.rationale,
        source: dto.source,
        rejectionReason: dto.rejectionReason,
        reviewer: dto.reviewer,
        rejectedAt: dto.rejectedAt,
        deletedAt: dto.deletedAt,
        approvedAt: dto.approvedAt,
        implementedAt: dto.implementedAt,
        obsolescenceReason: dto.obsolescenceReason,
        obsoleteAt: dto.obsoleteAt,
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

/** Approves a draft requirement through the backend lifecycle endpoint. */
export async function approveRequirement(requirementId: string, init?: RequestInit) {
    return runOrvalFetch(() => patchRequirementsIdApprove(requirementId, init)).then(mapRequirement);
}

/** Rejects a draft requirement through the backend lifecycle endpoint. */
export async function rejectRequirement(requirementId: string, dto: RejectRequirementDto, init?: RequestInit) {
    return runOrvalFetch(() => patchRequirementsIdReject(requirementId, dto, init)).then(mapRequirement);
}

/** Marks an approved requirement as implemented through the backend lifecycle endpoint. */
export async function markRequirementImplemented(requirementId: string, init?: RequestInit) {
    return runOrvalFetch(() => patchRequirementsIdImplemented(requirementId, init)).then(mapRequirement);
}

/** Marks an approved or rejected requirement as obsolete through the backend lifecycle endpoint. */
export async function markRequirementObsolete(
    requirementId: string,
    dto: MarkObsoleteRequirementDto,
    init?: RequestInit,
) {
    return runOrvalFetch(() => patchRequirementsIdObsolete(requirementId, dto, init)).then(mapRequirement);
}

/** Soft-deletes a draft requirement through the backend lifecycle endpoint. */
export async function deleteRequirement(requirementId: string, init?: RequestInit): Promise<void> {
    await runOrvalFetch(() => deleteRequirementsId(requirementId, init));
}
