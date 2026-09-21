import type { Requirement } from '@/api/requirementsApi';

export type RequirementTableRow = Requirement & Record<string, unknown>;

export function isRequirementTableRow(value: unknown): value is RequirementTableRow {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'id' in value && 'visibleKey' in value;
}
