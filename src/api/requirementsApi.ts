import { z } from 'zod';

import {
    getListRequirementsQueryKey,
    listRequirements as listGeneratedRequirements,
} from '@/api/generated/requirements/requirements';

export const requirementStatusSchema = z.enum(['draft', 'approved', 'implemented', 'obsolete', 'rejected']);

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
    sequenceNumber: z.number().int().positive().optional(),
    revisionNumber: z.number().int().positive(),
    visibleKey: z.string().regex(/^(FR|NFR)-[A-Z]{2,4}-[0-9]{4}$/u),
    status: requirementStatusSchema,
    description: nullableTextSchema,
    priority: z
        .enum(['p1', 'p2', 'p3'])
        .nullable()
        .optional()
        .transform((value) => value ?? null),
    owner: nullableTextSchema,
    rationale: nullableTextSchema,
    source: nullableTextSchema,
    rejectionReason: nullableTextSchema,
    reviewer: nullableTextSchema,
    rejectedAt: nullableIsoDateTimeSchema,
    deletedAt: nullableIsoDateTimeSchema,
    approvedAt: nullableIsoDateTimeSchema,
    implementedAt: nullableIsoDateTimeSchema,
    obsolescenceReason: nullableTextSchema,
    obsoleteAt: nullableIsoDateTimeSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export type Requirement = z.infer<typeof requirementSchema>;
export type RequirementStatus = z.infer<typeof requirementStatusSchema>;

const requirementsResponseSchema = z.array(requirementSchema);

export { getListRequirementsQueryKey as getListProjectRequirementsQueryKey };

export async function listProjectRequirementsRequest(projectId: string): Promise<Requirement[]> {
    const response = await listGeneratedRequirements(projectId);

    return requirementsResponseSchema.parse(response.data);
}
