import { createStore } from '@tanstack/react-store';

import type { RequirementStatus } from '@/api/requirementsApi';

export type ReviewActionRequirement = Readonly<{
    projectId: string;
    requirementId: string;
    visibleKey: string;
    status: RequirementStatus;
    implementationTicketCount?: number;
}>;

export type ReviewDecisionRequest = 'approve' | 'reject';

export type AdministratorActionRequest =
    | 'toggleUserStatus'
    | 'createProject'
    | 'renameProject'
    | 'deleteProject'
    | 'addMembership';

export type AdministratorUserActionContext = Readonly<{
    label: 'Activate account' | 'Deactivate account';
    disabled: boolean;
}>;

export type AdministratorProjectActionContext = Readonly<{
    selected: boolean;
    pending: boolean;
    addMembershipDisabled: boolean;
    deleteDisabled: boolean;
}>;

export type ActionBarState = Readonly<{
    requirementKey: string;
    reviewActionRequirement?: ReviewActionRequirement;
    reviewDecisionRequest?: ReviewDecisionRequest;
    implementationTicketsDialogOpen?: boolean;
    administratorActionRequest?: AdministratorActionRequest;
    administratorUserActionContext?: AdministratorUserActionContext;
    administratorProjectActionContext?: AdministratorProjectActionContext;
}>;

/** Stores route-aware action bar state shared between workspace pages and the application shell. */
export const actionBarStore = createStore<ActionBarState>({ requirementKey: '' });

/**
 * Resets all action bar state to its initial values.
 * @returns Nothing.
 */
export function resetActionBarStore(): void {
    actionBarStore.setState(() => ({ requirementKey: '' }));
}

/**
 * Updates the requirement key shown in the action bar lookup.
 * @param requirementKey Requirement key text to display.
 */
export function setRequirementKey(requirementKey: string): void {
    actionBarStore.setState((state) => ({ ...state, requirementKey }));
}

/**
 * Clears the requirement lookup value.
 * @returns Nothing.
 */
export function clearRequirementKey(): void {
    setRequirementKey('');
}

/**
 * Stores the requirement currently driving action-bar lifecycle actions.
 * @param reviewActionRequirement Requirement summary for action visibility and navigation.
 */
export function setReviewActionRequirement(reviewActionRequirement: ReviewActionRequirement): void {
    actionBarStore.setState((state) => ({
        ...state,
        reviewActionRequirement,
        implementationTicketsDialogOpen:
            state.reviewActionRequirement?.requirementId === reviewActionRequirement.requirementId ?
                state.implementationTicketsDialogOpen
            :   false,
    }));
}

/**
 * Clears the requirement action context and closes its ticket dialog.
 * @returns Nothing.
 */
export function clearReviewActionRequirement(): void {
    actionBarStore.setState((state) => ({
        ...state,
        reviewActionRequirement: undefined,
        implementationTicketsDialogOpen: false,
    }));
}

/**
 * Requests an approve or reject review decision.
 * @param reviewDecisionRequest Review decision to open.
 */
export function requestReviewDecision(reviewDecisionRequest: ReviewDecisionRequest): void {
    actionBarStore.setState((state) => ({ ...state, reviewDecisionRequest }));
}

/**
 * Clears the pending review decision request.
 * @returns Nothing.
 */
export function clearReviewDecisionRequest(): void {
    actionBarStore.setState((state) => ({ ...state, reviewDecisionRequest: undefined }));
}

/**
 * Opens the implementation-ticket dialog for the active requirement details route.
 * @returns Nothing.
 */
export function openImplementationTicketsDialog(): void {
    actionBarStore.setState((state) => ({ ...state, implementationTicketsDialogOpen: true }));
}

/**
 * Closes the implementation-ticket dialog.
 * @returns Nothing.
 */
export function closeImplementationTicketsDialog(): void {
    actionBarStore.setState((state) => ({ ...state, implementationTicketsDialogOpen: false }));
}


/** Requests an Administrator workspace action from the active page. */
export function requestAdministratorAction(administratorActionRequest: AdministratorActionRequest): void {
    actionBarStore.setState((state) => ({ ...state, administratorActionRequest }));
}

/** Clears the Administrator workspace action request after it is consumed. */
export function clearAdministratorActionRequest(): void {
    actionBarStore.setState((state) => ({ ...state, administratorActionRequest: undefined }));
}

/** Publishes selected-user action state for the shared ActionBar. */
export function setAdministratorUserActionContext(
    administratorUserActionContext: AdministratorUserActionContext | undefined,
): void {
    actionBarStore.setState((state) => ({ ...state, administratorUserActionContext }));
}

/** Publishes project action state for the shared ActionBar. */
export function setAdministratorProjectActionContext(
    administratorProjectActionContext: AdministratorProjectActionContext | undefined,
): void {
    actionBarStore.setState((state) => ({ ...state, administratorProjectActionContext }));
}
