import { createStore } from '@tanstack/react-store';

import type { RequirementStatus } from '@/api/requirementsApi';

export type ReviewActionRequirement = Readonly<{
    projectId: string;
    requirementId: string;
    visibleKey: string;
    status: RequirementStatus;
}>;

export type ActionBarState = Readonly<{ requirementKey: string; reviewActionRequirement?: ReviewActionRequirement }>;

export const actionBarStore = createStore<ActionBarState>({ requirementKey: '' });

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
