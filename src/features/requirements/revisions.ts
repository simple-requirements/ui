import type { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { requirementRevisionKeys } from '@/api/queryKeys';
import { apiFetch } from '@/api/client/config';
import type { RequirementRevisionResponseDto } from '@/api/generated/models';
import {
    GetRequirementsIdRevisionsResponse,
    GetRequirementsIdRevisionsRevisionNumberResponse,
} from '@/api/generated/zod/requirements/requirements.zod';
import { mapRequirement } from '@/features/requirements/api/requirementsApi';
import type { RequirementView } from '@/types/domain';

export type DifferenceKind = 'unchanged' | 'added' | 'removed' | 'changed';
export type ComparisonSource =
    | { kind: 'current'; label: 'Current requirement'; requirement: RequirementView }
    | { kind: 'revision'; label: string; revision: RequirementRevisionView };

export interface RequirementRevisionView extends RequirementView {
    readonly requirementId: string;
    readonly revisionNumber: number;
    readonly requirementCreatedAt: string;
    readonly requirementUpdatedAt: string;
    readonly readOnly: true;
}

export interface ComparedField {
    field: string;
    label: string;
    kind: 'text' | 'metadata' | 'unavailable';
    left: string | null;
    right: string | null;
    difference: DifferenceKind;
}

export const textComparisonFields = new Set<keyof RequirementView>([
    'description',
    'rationale',
    'source',
    'rejectionReason',
]);

export const fieldLabel = (field: string) =>
    field.replace(/[A-Z]/g, (c) => ` ${c.toLowerCase()}`).replace(/^./, (c) => c.toUpperCase());

export const revisionComparisonFields: readonly (keyof RequirementView)[] = [
    'visibleKey',
    'categoryId',
    'categoryKey',
    'type',
    'description',
    'priority',
    'owner',
    'rationale',
    'source',
    'status',
    'rejectionReason',
    'reviewer',
    'rejectedAt',
    'deletedAt',
    'approvedAt',
    'implementedAt',
    'obsolescenceReason',
    'obsoleteAt',
    'createdAt',
    'updatedAt',
];

/** Maps and validates one backend immutable revision snapshot into the UI read-only model. */
export function mapRequirementRevision(dto: RequirementRevisionResponseDto): RequirementRevisionView {
    const parsed = GetRequirementsIdRevisionsRevisionNumberResponse.parse(dto);
    return {
        ...mapRequirement(parsed),
        id: parsed.requirementId,
        requirementId: parsed.requirementId,
        revisionNumber: parsed.revisionNumber,
        requirementCreatedAt: parsed.requirementCreatedAt,
        requirementUpdatedAt: parsed.requirementUpdatedAt,
        readOnly: true,
    };
}

/** Loads the backend-defined revision list without fabricating missing revisions. */
export async function listRequirementRevisions(requirementId: string, init?: RequestInit) {
    const response = GetRequirementsIdRevisionsResponse.parse(
        await apiFetch<RequirementRevisionResponseDto[]>(
            `/requirements/${encodeURIComponent(requirementId)}/revisions`,
            { ...init, method: 'GET' },
        ),
    );
    return response.map(mapRequirementRevision);
}

/** Loads one immutable historical snapshot on demand for detail or comparison display. */
export async function getRequirementRevision(requirementId: string, revisionNumber: number, init?: RequestInit) {
    return mapRequirementRevision(
        await apiFetch<RequirementRevisionResponseDto>(
            `/requirements/${encodeURIComponent(requirementId)}/revisions/${encodeURIComponent(String(revisionNumber))}`,
            { ...init, method: 'GET' },
        ),
    );
}

/** Classifies raw nullable field values without conflating null and empty strings. */
export function classifyDifference(left: string | null, right: string | null): DifferenceKind {
    if (left === right) return 'unchanged';
    if (left === null && right !== null) return 'added';
    if (left !== null && right === null) return 'removed';
    return 'changed';
}

export function makeRevisionSource(revision: RequirementRevisionView): ComparisonSource {
    return { kind: 'revision', label: `Revision ${String(revision.revisionNumber)}`, revision };
}

export function makeCurrentSource(requirement: RequirementView): ComparisonSource {
    return { kind: 'current', label: 'Current requirement', requirement };
}

const sourceKey = (source: ComparisonSource) =>
    source.kind === 'current' ?
        `current:${source.requirement.id}`
    :   `revision:${source.revision.requirementId}:${String(source.revision.revisionNumber)}`;

const comparisonSourcesSchema = z
    .object({
        left: z.custom<ComparisonSource>((source) => Boolean(source), 'Select two comparison sources.'),
        right: z.custom<ComparisonSource>((source) => Boolean(source), 'Select two comparison sources.'),
    })
    .superRefine(({ left, right }, context) => {
        if (sourceKey(left) === sourceKey(right)) {
            context.addIssue({ code: 'custom', message: 'Select two different comparison sources.', path: ['right'] });
            return;
        }
        const leftRequirementId = left.kind === 'current' ? left.requirement.id : left.revision.requirementId;
        const rightRequirementId = right.kind === 'current' ? right.requirement.id : right.revision.requirementId;
        if (leftRequirementId !== rightRequirementId) {
            context.addIssue({ code: 'custom', message: 'Comparison is limited to one requirement.', path: ['right'] });
        }
    });

/** Validates the two comparison slots using Zod so UI and tests share one contract. */
export function validateComparisonSources(left: ComparisonSource | null, right: ComparisonSource | null) {
    const result = comparisonSourcesSchema.safeParse({ left, right });
    return result.success ? null : (result.error.issues[0]?.message ?? 'Select two comparison sources.');
}

const sourceRequirement = (source: ComparisonSource) =>
    source.kind === 'current' ? source.requirement : source.revision;

/** Compares all supported snapshot fields and returns accessible field-level classifications. */
export function compareSources(left: ComparisonSource, right: ComparisonSource): ComparedField[] {
    return revisionComparisonFields.map((field) => {
        const leftValue = sourceRequirement(left)[field] ?? null;
        const rightValue = sourceRequirement(right)[field] ?? null;
        return {
            field,
            label: fieldLabel(field),
            kind: textComparisonFields.has(field) ? 'text' : 'metadata',
            left: leftValue,
            right: rightValue,
            difference: classifyDifference(leftValue, rightValue),
        };
    });
}

/** Invalidates one requirement's immutable revision list after mutations that may create a new revision. */
export async function invalidateRequirementRevisionHistory(queryClient: QueryClient, requirementId: string) {
    await queryClient.invalidateQueries({ queryKey: requirementRevisionKeys.all(requirementId) });
}

/** Guards delayed revision responses so closed or changed selections cannot overwrite the active snapshot. */
export function shouldAcceptRevisionResponse(
    activeRequirementId: string,
    selectedRevisionNumber: number | null,
    revision: RequirementRevisionView,
) {
    return revision.requirementId === activeRequirementId && revision.revisionNumber === selectedRevisionNumber;
}

export function visibleComparedFields(fields: readonly ComparedField[], showUnchanged: boolean) {
    return showUnchanged ? fields : fields.filter((field) => field.difference !== 'unchanged');
}

export function mapComparisonError(error: unknown) {
    const mapped =
        error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 404 ?
            'The requested revision was not found.'
        :   'Unable to load comparison data. Please try again.';
    return mapped;
}
