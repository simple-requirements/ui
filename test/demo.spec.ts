import { describe, expect, it } from 'vitest';
import { demoCategories, demoProjectFixtures, generateRequirements, initialProjects } from '@/demo/demoData';
import { lifecycleActions } from '@/features/requirements/requirementActions';
import { loadWorkspaceState, WORKSPACE_STATE_KEY } from '@/state/sessionPersistence';
import { clampSplitter, initialWorkspaceState, workspaceReducer } from '@/state/workspaceReducer';

describe('demo data generation', () => {
    it('creates exactly eight deterministic projects and derives each project count from generated requirements', () => {
        const generatedRequirements = generateRequirements();
        const generatedProjects = initialProjects();

        expect(demoProjectFixtures).toHaveLength(8);
        expect(generatedProjects.map((project) => project.requirementCount)).toEqual(
            demoProjectFixtures.map(
                (project) => generatedRequirements.filter((requirement) => requirement.projectId === project.id).length,
            ),
        );
    });

    it('keeps requirement category type, visible-key prefix, and visible-key uniqueness consistent', () => {
        const categoryByKey = new Map(demoCategories.map((category) => [category.key, category]));
        const visibleKeys = new Set<string>();

        for (const requirement of generateRequirements()) {
            expect(requirement.type).toBe(categoryByKey.get(requirement.categoryKey)?.type);
            expect(requirement.visibleKey.startsWith(requirement.type)).toBe(true);
            expect(visibleKeys.has(requirement.visibleKey)).toBe(false);
            visibleKeys.add(requirement.visibleKey);
        }
    });

    it('keeps project fixtures free of presentation-only icon fields', () => {
        expect(demoProjectFixtures.some((project) => 'icon' in project)).toBe(false);
    });
});

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

    it('clamps splitter positions to the supported demo range', () => {
        expect(clampSplitter(0)).toBe(0.25);
        expect(clampSplitter(1)).toBe(0.8);
    });
});

describe('requirement actions and session persistence', () => {
    it('returns only valid lifecycle actions for each demonstrated status', () => {
        expect(lifecycleActions('draft')).toEqual(['Edit', 'Approve', 'Reject']);
        expect(lifecycleActions('implemented')).toEqual([]);
        expect(lifecycleActions('obsolete')).toEqual([]);
    });

    it('recovers safely when the persisted workspace session state is corrupt', () => {
        sessionStorage.setItem(WORKSPACE_STATE_KEY, 'not-json');

        expect(loadWorkspaceState()).toEqual(initialWorkspaceState);
    });
});
