import type { ProjectPermissions } from '@/auth/projectPermissions';
import {
    canBecomeObsolete,
    isDraftRequirementStatus,
} from '@/components/RootLayout/ActionBar/actionBarRequirementStatus';
import type { ActionBarConfiguration } from '@/components/RootLayout/ActionBar/actionBarConfiguration';
import type { ReviewActionRequirement } from '@/stores/actionBarStore';

export type ActionBarAvailability = Readonly<{
    showCreate: boolean;
    canCreate: boolean;
    canEditRequirement: boolean;
    canEditCategory: boolean;
    canManageTickets: boolean;
    canMarkObsolete: boolean;
    canMarkImplemented: boolean;
    canReview: boolean;
    canDecideReview: boolean;
}>;

/**
 * Returns whether a create action belongs on the current route.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @returns True when the create action should be shown.
 */
function shouldShowCreate(configuration: ActionBarConfiguration, permissions: ProjectPermissions): boolean {
    return configuration.createActionKind !== undefined && permissions.canManageRequirements;
}

/**
 * Returns whether the create action can be used.
 * @param showCreate Whether the create action is visible.
 * @param configuration Active route ActionBar configuration.
 * @param projectId Active project identifier.
 * @returns True when the create action is enabled.
 */
function canCreate(showCreate: boolean, configuration: ActionBarConfiguration, projectId: string | undefined): boolean {
    return showCreate && !configuration.disabled && projectId !== undefined;
}

/**
 * Returns whether the current requirement can be edited from this route.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Active requirement action context.
 * @returns True when requirement editing is available.
 */
function canEditRequirement(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
): boolean {
    return (
        (configuration.showEditRequirement ?? false)
        && permissions.canManageRequirements
        && requirement !== undefined
        && requirement.status !== 'rejected'
    );
}

/**
 * Returns whether the active category can be edited from the ActionBar.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param projectId Active project identifier.
 * @param categoryId Active category identifier.
 * @returns True when category editing is available.
 */
function canEditCategory(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    projectId: string | undefined,
    categoryId: string | undefined,
): boolean {
    return (
        (configuration.showEditCategory ?? false)
        && permissions.canManageRequirements
        && projectId !== undefined
        && categoryId !== undefined
    );
}

/**
 * Returns whether implementation-ticket management is available.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Active requirement action context.
 * @returns True when the ticket dialog can be opened.
 */
function canManageTickets(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
): boolean {
    return (
        (configuration.showImplementationTickets ?? false)
        && permissions.canManageTickets
        && requirement?.status === 'approved'
    );
}

/**
 * Returns whether the requirement can be marked obsolete.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Active requirement action context.
 * @returns True when obsolescence is available.
 */
function canMarkObsoleteAction(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
): boolean {
    return (
        (configuration.showObsoleteRequirement ?? false)
        && permissions.canManageRequirements
        && canBecomeObsolete(requirement?.status)
    );
}

/**
 * Returns whether the requirement can be marked implemented.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Active requirement action context.
 * @returns True when implementation completion is available.
 */
function canMarkImplemented(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
): boolean {
    return (
        (configuration.showImplementedRequirement ?? false)
        && permissions.canManageRequirements
        && requirement?.status === 'approved'
        && (requirement.implementationTicketCount ?? 0) > 0
    );
}

/**
 * Returns whether the review workspace can be opened.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Active requirement action context.
 * @returns True when review is available.
 */
function canReviewRequirement(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
): boolean {
    return (
        (configuration.showReview ?? false)
        && permissions.canManageRequirements
        && isDraftRequirementStatus(requirement?.status)
    );
}

/**
 * Returns whether approve/reject review actions are available.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Active requirement action context.
 * @returns True when review decisions are available.
 */
function canDecideReview(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
): boolean {
    return (
        (configuration.showReviewDecisions ?? false)
        && permissions.canManageRequirements
        && isDraftRequirementStatus(requirement?.status)
    );
}

/**
 * Calculates route-specific ActionBar action availability.
 * @param configuration Active route ActionBar configuration.
 * @param permissions Current project permissions.
 * @param requirement Requirement driving lifecycle actions, when applicable.
 * @param projectId Active project identifier.
 * @param categoryId Active category identifier.
 * @returns Visibility and enablement flags for ActionBar controls.
 */
export function getActionBarAvailability(
    configuration: ActionBarConfiguration,
    permissions: ProjectPermissions,
    requirement: ReviewActionRequirement | undefined,
    projectId: string | undefined,
    categoryId: string | undefined,
): ActionBarAvailability {
    const showCreate = shouldShowCreate(configuration, permissions);

    return {
        showCreate,
        canCreate: canCreate(showCreate, configuration, projectId),
        canEditRequirement: canEditRequirement(configuration, permissions, requirement),
        canEditCategory: canEditCategory(configuration, permissions, projectId, categoryId),
        canManageTickets: canManageTickets(configuration, permissions, requirement),
        canMarkObsolete: canMarkObsoleteAction(configuration, permissions, requirement),
        canMarkImplemented: canMarkImplemented(configuration, permissions, requirement),
        canReview: canReviewRequirement(configuration, permissions, requirement),
        canDecideReview: canDecideReview(configuration, permissions, requirement),
    };
}
