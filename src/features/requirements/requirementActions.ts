import type { RequirementStatus } from '@/types/domain';
/** Returns direct demo lifecycle actions that are valid for a requirement status. */
export function lifecycleActions(status: RequirementStatus) {
    if (status === 'draft') return ['Edit', 'Approve', 'Reject'];
    if (status === 'approved') return ['Mark implemented', 'Mark obsolete'];
    if (status === 'rejected') return ['Mark obsolete'];
    return [];
}
