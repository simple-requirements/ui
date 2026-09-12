import { z } from 'zod';

import type { CreateRequirementDto, UpdateRequirementDto } from '@/api/generated/model';
import {
    createRequirement as createGeneratedRequirement,
    getListRequirementsQueryKey,
    listRequirements as listGeneratedRequirements,
    updateRequirement as updateGeneratedRequirement,
} from '@/api/generated/requirements/requirements';
import { apiFetch } from '@/api/fetch';

export const requirementStatusSchema = z.enum(['draft', 'approved', 'implemented', 'obsolete', 'rejected']);
export const requirementPrioritySchema = z.enum(['p1', 'p2', 'p3']);
export const implementationTicketSchema = z.object({
    id: z.uuid(),
    requirementId: z.uuid(),
    ticketId: z.string().min(1),
    completedBy: z.string().min(1),
    completedAt: z.iso.date(),
    url: z.url().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type ImplementationTicket = z.infer<typeof implementationTicketSchema>;
export type ImplementationTicketInput = Readonly<
    Pick<ImplementationTicket, 'ticketId' | 'completedBy' | 'completedAt'>
>;

const nullableIsoDateTimeSchema = z.iso
    .datetime()
    .nullable()
    .optional()
    .transform((value) => value ?? null);
const nullableTextSchema = z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null);

export const requirementSchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    categoryId: z.uuid(),
    sequenceNumber: z.number().int().positive(),
    revisionNumber: z.number().int().positive(),
    changeType: z.string().min(1),
    changeReason: z.string().min(1),
    changedAt: z.iso.datetime(),
    changedByUserId: z.uuid().nullable(),
    changedByDisplayName: z.string().min(1),
    visibleKey: z.string().regex(/^(FR|NFR)-[A-Z]{2,4}-[0-9]{4}$/u),
    status: requirementStatusSchema,
    description: nullableTextSchema,
    priority: requirementPrioritySchema
        .nullable()
        .optional()
        .transform((value) => value ?? null),
    owner: nullableTextSchema,
    rationale: nullableTextSchema,
    source: nullableTextSchema,
    rejectionReason: nullableTextSchema,
    reviewer: nullableTextSchema,
    obsoletedBy: nullableTextSchema,
    rejectedAt: nullableIsoDateTimeSchema,
    approvedAt: nullableIsoDateTimeSchema,
    implementedAt: nullableIsoDateTimeSchema,
    obsolescenceReason: nullableTextSchema,
    obsoleteAt: nullableIsoDateTimeSchema,
    implementationTickets: z.array(implementationTicketSchema).default([]),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

const optionalTrimmedTextSchema = z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value));

const optionalLongTextSchema = optionalTrimmedTextSchema;
const optionalShortTextSchema = optionalTrimmedTextSchema.pipe(
    z.string().max(120, 'Value must contain at most 120 characters.').nullable(),
);

export const createRequirementRequestSchema = z.object({
    categoryId: z.uuid('Category is required.'),
    description: optionalLongTextSchema,
    priority: z.union([requirementPrioritySchema, z.literal('')]).transform((value) => (value === '' ? null : value)),
    owner: optionalShortTextSchema,
    rationale: optionalLongTextSchema,
    source: optionalLongTextSchema,
});

export const updateRequirementRequestSchema = createRequirementRequestSchema
    .partial({ categoryId: true })
    .extend({
        changeReason: z
            .string()
            .trim()
            .min(1, 'Change reason is required.')
            .max(500, 'Change reason must contain at most 500 characters.'),
    });

export type Requirement = z.infer<typeof requirementSchema>;
export type RequirementStatus = z.infer<typeof requirementStatusSchema>;
export type RequirementPriority = z.infer<typeof requirementPrioritySchema>;
export type CreateRequirementRequest = z.infer<typeof createRequirementRequestSchema>;
export type UpdateRequirementRequest = z.infer<typeof updateRequirementRequestSchema>;

const requirementsResponseSchema = z.array(requirementSchema);

const requirementRevisionValueSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.unknown()),
    z.record(z.string(), z.unknown()),
    z.null(),
]);

export const requirementRevisionDifferenceSchema = z.object({
    field: z.string().min(1),
    from: requirementRevisionValueSchema,
    to: requirementRevisionValueSchema,
});

export const requirementRevisionComparisonSchema = z.object({
    projectId: z.uuid(),
    requirementId: z.uuid(),
    fromRevision: z.number().int().positive(),
    toRevision: z.number().int().positive(),
    differences: z.array(requirementRevisionDifferenceSchema),
});

export type RequirementRevisionDifference = z.infer<typeof requirementRevisionDifferenceSchema>;
export type RequirementRevisionComparison = z.infer<typeof requirementRevisionComparisonSchema>;

function toCreateRequirementDto(requirement: CreateRequirementRequest): CreateRequirementDto {
    return requirement as unknown as CreateRequirementDto;
}

function toUpdateRequirementDto(requirement: UpdateRequirementRequest): UpdateRequirementDto {
    return requirement as unknown as UpdateRequirementDto;
}

function toRequirementLifecycleDto(
    requirement: Readonly<{ status: RequirementStatus; obsolescenceReason?: string }>,
): UpdateRequirementDto {
    return requirement as unknown as UpdateRequirementDto;
}

export { getListRequirementsQueryKey as getListProjectRequirementsQueryKey };

export async function listProjectRequirementsRequest(projectId: string): Promise<Requirement[]> {
    const response = await listGeneratedRequirements(projectId);

    return requirementsResponseSchema.parse(response.data);
}

/**
 * Lists all immutable revisions of one requirement, including the current revision.
 *
 * @param projectId - Owning project identifier.
 * @param requirementId - Requirement identifier.
 * @returns Parsed requirement revisions ordered by revision number.
 */
export async function listRequirementRevisionsRequest(
    projectId: string,
    requirementId: string,
): Promise<Requirement[]> {
    const response = await apiFetch<{ data: unknown }>(
        `/projects/${projectId}/requirements/${requirementId}/revisions`,
        { method: 'GET' },
    );

    return requirementsResponseSchema.parse(response.data);
}

/**
 * Compares two immutable revisions of one requirement.
 *
 * @param projectId - Owning project identifier.
 * @param requirementId - Requirement identifier.
 * @param fromRevision - Source revision number.
 * @param toRevision - Target revision number.
 * @returns Parsed field-level revision differences.
 */
export async function compareRequirementRevisionsRequest(
    projectId: string,
    requirementId: string,
    fromRevision: number,
    toRevision: number,
): Promise<RequirementRevisionComparison> {
    const response = await apiFetch<{ data: unknown }>(
        `/projects/${projectId}/requirements/${requirementId}/revisions/compare?from=${fromRevision.toString()}&to=${toRevision.toString()}`,
        { method: 'GET' },
    );

    return requirementRevisionComparisonSchema.parse(response.data);
}

const ticketBaseUrl = (projectId: string, requirementId: string) =>
    `/projects/${projectId}/requirements/${requirementId}/implementation-tickets`;

export async function createImplementationTicketRequest(
    projectId: string,
    requirementId: string,
    input: ImplementationTicketInput,
): Promise<ImplementationTicket> {
    const response = await apiFetch<{ data: unknown }>(ticketBaseUrl(projectId, requirementId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return implementationTicketSchema.parse(response.data);
}

export async function updateImplementationTicketRequest(
    projectId: string,
    requirementId: string,
    id: string,
    input: ImplementationTicketInput,
): Promise<ImplementationTicket> {
    const response = await apiFetch<{ data: unknown }>(`${ticketBaseUrl(projectId, requirementId)}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return implementationTicketSchema.parse(response.data);
}

export async function deleteImplementationTicketRequest(
    projectId: string,
    requirementId: string,
    id: string,
): Promise<void> {
    await apiFetch(`${ticketBaseUrl(projectId, requirementId)}/${id}`, { method: 'DELETE' });
}

export async function markProjectRequirementImplementedRequest(
    projectId: string,
    requirementId: string,
): Promise<Requirement> {
    const response = await updateGeneratedRequirement(
        projectId,
        requirementId,
        toRequirementLifecycleDto({ status: 'implemented' }),
    );
    return requirementSchema.parse(response.data);
}

export async function createProjectRequirementRequest(
    projectId: string,
    requirement: CreateRequirementRequest,
): Promise<Requirement> {
    const response = await createGeneratedRequirement(projectId, toCreateRequirementDto(requirement));

    return requirementSchema.parse(response.data);
}

export async function updateProjectRequirementRequest(
    projectId: string,
    requirementId: string,
    requirement: UpdateRequirementRequest,
): Promise<Requirement> {
    const response = await updateGeneratedRequirement(projectId, requirementId, toUpdateRequirementDto(requirement));

    return requirementSchema.parse(response.data);
}

export async function markProjectRequirementObsoleteRequest(
    projectId: string,
    requirementId: string,
    obsolescenceReason: string,
): Promise<Requirement> {
    const response = await updateGeneratedRequirement(
        projectId,
        requirementId,
        toRequirementLifecycleDto({ status: 'obsolete', obsolescenceReason }),
    );

    return requirementSchema.parse(response.data);
}
