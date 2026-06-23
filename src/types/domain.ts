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

/** Project-scoped metric returned by backend metric APIs. */
export interface MetricView {
    id: string;
    projectId: string;
    key: string;
    value: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Resolved or unresolved metric reference embedded in a requirement description. */
export interface MetricReferenceView {
    id: string | null;
    key: string;
    value: string | null;
    description: string | null;
    resolved: boolean;
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
    renderedDescription: string;
    metricReferences: readonly MetricReferenceView[];
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

export type RequirementLinkRelationshipType = 'references';
export type RequirementLinkHistoryEventType = 'created' | 'target_changed' | 'deleted';

/** Requirement-to-requirement link view model used by detail, link forms, and history comparison. */
export interface RequirementLinkView {
    id: string;
    projectId: string;
    relationshipType: RequirementLinkRelationshipType;
    sourceRequirementId: string;
    sourceVisibleKey: string;
    sourceType: RequirementType;
    sourceCategoryId: string;
    sourceCategoryKey: string;
    sourceStatus: RequirementStatus;
    targetRequirementId: string;
    targetVisibleKey: string;
    targetType: RequirementType;
    targetCategoryId: string;
    targetCategoryKey: string;
    targetStatus: RequirementStatus;
    createdAt: string;
    updatedAt: string;
}

export interface LinkCollectionView {
    outgoingLinks: readonly RequirementLinkView[];
    incomingLinks: readonly RequirementLinkView[];
}

/** Auditable requirement-link lifecycle event from the backend link-history API. */
export interface RequirementLinkHistoryEventView {
    id: string;
    linkId: string;
    projectId: string;
    eventType: RequirementLinkHistoryEventType;
    relationshipType: RequirementLinkRelationshipType;
    sourceRequirementId: string;
    sourceVisibleKey: string;
    oldTargetRequirementId: string | null;
    oldTargetVisibleKey: string | null;
    newTargetRequirementId: string | null;
    newTargetVisibleKey: string | null;
    occurredAt: string;
    actor: string | null;
    reason: string | null;
}

export interface RequirementRevisionLinksView extends LinkCollectionView {
    requirementId: string;
    revisionNumber: number;
    revisionCreatedAt: string;
}

export interface RequirementLinkChangesView {
    requirementId: string;
    fromRevision: number;
    toRevision: number;
    addedOutgoingLinks: readonly RequirementLinkView[];
    removedOutgoingLinks: readonly RequirementLinkView[];
    unchangedOutgoingLinks: readonly RequirementLinkView[];
    addedIncomingLinks: readonly RequirementLinkView[];
    removedIncomingLinks: readonly RequirementLinkView[];
    unchangedIncomingLinks: readonly RequirementLinkView[];
}
