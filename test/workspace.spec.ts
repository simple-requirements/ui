import { describe, expect, it } from 'vitest';
import { lifecycleActions } from '@/features/requirements/requirementActions';
import { loadWorkspaceState, WORKSPACE_STATE_KEY } from '@/state/sessionPersistence';
import { clampSplitter, initialWorkspaceState, workspaceReducer } from '@/state/workspaceReducer';

describe('workspace reducer', () => {
    it('opens a requirement tab only once for the same requirement', () => {
        const stateWithOpenTab = workspaceReducer(initialWorkspaceState, {
            type: 'openRequirementTab',
            requirementId: 'requirement-1',
            visibleKey: 'FR-AUTH-0001',
        });
        const stateAfterDuplicateOpen = workspaceReducer(stateWithOpenTab, {
            type: 'openRequirementTab',
            requirementId: 'requirement-1',
            visibleKey: 'FR-AUTH-0001',
        });

        expect(stateAfterDuplicateOpen.openRequirementTabs).toHaveLength(1);
    });

    it('returns focus to the workspace tab when the active requirement tab closes', () => {
        const stateWithActiveRequirementTab = workspaceReducer(initialWorkspaceState, {
            type: 'openRequirementTab',
            requirementId: 'requirement-1',
            visibleKey: 'FR-AUTH-0001',
        });
        const stateAfterClose = workspaceReducer(stateWithActiveRequirementTab, {
            type: 'closeTab',
            tabId: 'req-tab-requirement-1',
        });

        expect(stateAfterClose.activeAppTabId).toBe('workspace');
    });

    it('clamps splitter positions to the supported workspace range', () => {
        expect(clampSplitter(0)).toBe(0.25);
        expect(clampSplitter(1)).toBe(0.8);
    });
});

describe('requirement actions and session persistence', () => {
    it('returns only valid lifecycle actions for each supported status', () => {
        expect(lifecycleActions('draft')).toEqual(['Edit', 'Approve', 'Reject']);
        expect(lifecycleActions('implemented')).toEqual([]);
        expect(lifecycleActions('obsolete')).toEqual([]);
    });

    it('recovers safely when the persisted workspace session state is corrupt', () => {
        sessionStorage.setItem(WORKSPACE_STATE_KEY, 'not-json');

        expect(loadWorkspaceState()).toEqual(initialWorkspaceState);
    });
});
