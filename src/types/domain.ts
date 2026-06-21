/** Backend-owned requirement category type. Requirement type is derived from the assigned category. */
export type RequirementType = 'FR' | 'NFR';

/** Lifecycle statuses returned by the backend for read-only requirement browsing. */
export type RequirementStatus = 'draft' | 'approved' | 'implemented' | 'obsolete' | 'rejected' | 'deleted';

/** Project sidebar view model. Counts are authoritative backend values, not derived from loaded rows. */
export interface ProjectSummary {
    id: string;
    name: string;
    requirementCount: number;
}

/** Global category view model used by category browsing and requirement display. */
export interface Category {
    id: string;
    key: string;
    name: string;
    type: RequirementType;
}

/** Requirement view model shared by list, split-pane detail, exact-key lookup, and dedicated tabs. */
export interface RequirementView {
    id: string;
    projectId: string | null;
    visibleKey: string;
    categoryId: string;
    categoryKey: string;
    categoryName: string;
    type: RequirementType;
    description: string;
    priority: string;
    status: RequirementStatus;
    owner: string | null;
    rationale: string | null;
    source: string | null;
    rejectionReason?: string | null;
    reviewer?: string | null;
    rejectedAt?: string | null;
    deletedAt?: string | null;
    approvedAt?: string | null;
    implementedAt?: string | null;
    obsolescenceReason?: string | null;
    obsoleteAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
