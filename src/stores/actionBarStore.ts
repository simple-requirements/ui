import { createStore } from '@tanstack/react-store';

export type ActionBarState = Readonly<{ requirementKey: string }>;

export const actionBarStore = createStore<ActionBarState>({ requirementKey: '' });

export function setRequirementKey(requirementKey: string): void {
    actionBarStore.setState((state) => ({ ...state, requirementKey }));
}

export function clearRequirementKey(): void {
    setRequirementKey('');
}
