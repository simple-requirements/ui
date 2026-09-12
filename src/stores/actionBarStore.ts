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

export type ActionBarState = Readonly<{
    requirementKey: string;
    reviewActionRequirement?: ReviewActionRequirement;
    reviewDecisionRequest?: ReviewDecisionRequest;
}>;

export const actionBarStore = createStore<ActionBarState>({ requirementKey: '' });

export function resetActionBarStore(): void {
    actionBarStore.setState(() => ({ requirementKey: '' }));
}

export function setRequirementKey(requirementKey: string): void {
    actionBarStore.setState((state) => ({ ...state, requirementKey }));
}

export function clearRequirementKey(): void {
    setRequirementKey('');
}

export function setReviewActionRequirement(reviewActionRequirement: ReviewActionRequirement): void {
    actionBarStore.setState((state) => ({ ...state, reviewActionRequirement }));
}

export function clearReviewActionRequirement(): void {
    actionBarStore.setState((state) => ({ ...state, reviewActionRequirement: undefined }));
}

export function requestReviewDecision(reviewDecisionRequest: ReviewDecisionRequest): void {
    actionBarStore.setState((state) => ({ ...state, reviewDecisionRequest }));
}

export function clearReviewDecisionRequest(): void {
    actionBarStore.setState((state) => ({ ...state, reviewDecisionRequest: undefined }));
}
