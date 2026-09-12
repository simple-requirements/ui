import { getProjectCategoryCreateRoute, getProjectRequirementCreateRoute } from '@/router/projectRoutes';
import type { ActionBarKind } from '@/router/routeUiMetadata';

export type CreateActionKind = 'category' | 'requirement';

export type ActionBarConfiguration = Readonly<{
    ariaLabel: string;
    createActionKind?: CreateActionKind;
    disabled: boolean;
    showRequirementLookup: boolean;
    showEditRequirement?: boolean;
    showObsoleteRequirement?: boolean;
    showImplementedRequirement?: boolean;
    showReview?: boolean;
    showReviewDecisions?: boolean;
}>;

export function getActionBarConfiguration(actionBarKind: ActionBarKind): ActionBarConfiguration {
    switch (actionBarKind) {
        case 'categories':
            return {
                ariaLabel: 'Category actions',
                createActionKind: 'category',
                disabled: false,
                showRequirementLookup: false,
            };
        case 'categoryForm':
            return {
                ariaLabel: 'Category form actions',
                createActionKind: 'category',
                disabled: true,
                showRequirementLookup: false,
            };
        case 'requirementDetails':
            return {
                ariaLabel: 'Requirement actions',
                createActionKind: 'requirement',
                disabled: false,
                showRequirementLookup: false,
                showEditRequirement: true,
                showObsoleteRequirement: true,
                showImplementedRequirement: true,
                showReview: true,
            };
        case 'requirementForm':
            return {
                ariaLabel: 'Requirement form actions',
                createActionKind: 'requirement',
                disabled: true,
                showRequirementLookup: false,
            };
        case 'requirements':
            return {
                ariaLabel: 'Requirement actions',
                createActionKind: 'requirement',
                disabled: false,
                showRequirementLookup: true,
                showEditRequirement: true,
                showObsoleteRequirement: true,
                showImplementedRequirement: true,
                showReview: true,
            };
        case 'project':
            return { ariaLabel: 'Project actions', disabled: false, showRequirementLookup: false };
        case 'none':
            return { ariaLabel: 'Workspace actions', disabled: true, showRequirementLookup: false };
        case 'review':
            return {
                ariaLabel: 'Requirement review actions',
                disabled: false,
                showRequirementLookup: false,
                showEditRequirement: true,
                showReviewDecisions: true,
            };
    }
}

export function getCreateRoute(projectId: string, createActionKind: CreateActionKind): string {
    return createActionKind === 'category' ?
            getProjectCategoryCreateRoute(projectId)
        :   getProjectRequirementCreateRoute(projectId);
}
