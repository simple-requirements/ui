export type RequirementType = 'FR' | 'NFR';
export type RequirementStatus = 'draft' | 'approved' | 'implemented' | 'obsolete' | 'rejected' | 'deleted';
export interface ProjectSummary {
    id: string;
    name: string;
    requirementCount: number;
}
export interface Category {
    id: string;
    key: string;
    name: string;
    type: RequirementType;
}
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
    createdAt?: string;
    updatedAt?: string;
}
