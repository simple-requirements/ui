import { describe, expect, it } from 'vitest';
import { mapApiError } from '@/api/errors/apiError';
import { categoryKeys, projectKeys, requirementKeys } from '@/api/queryKeys';
import { mapCategory } from '@/features/categories/api/categoriesApi';
import { mapRequirement } from '@/features/requirements/api/requirementsApi';
import { loadWorkspaceState, saveWorkspaceState, WORKSPACE_STATE_KEY } from '@/state/sessionPersistence';
import { initialWorkspaceState } from '@/state/workspaceReducer';

describe('backend integration helpers', () => {
    it('defines stable query keys', () => {
        expect(projectKeys.all).toEqual(['projects']);
        expect(categoryKeys.all).toEqual(['categories']);
        expect(requirementKeys.list('project-1')).toEqual(['requirements', 'list', 'project-1']);
        expect(requirementKeys.detail('requirement-1')).toEqual(['requirements', 'detail', 'requirement-1']);
        expect(requirementKeys.byVisibleKey('FR-ABC-0001')).toEqual(['requirements', 'visible-key', 'FR-ABC-0001']);
    });

    it('maps generated category responses to view models without a both type', () => {
        expect(
            mapCategory({
                id: 'cat-1',
                key: 'PERF',
                name: 'Performance',
                type: 'NFR',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
            }),
        ).toEqual({ id: 'cat-1', key: 'PERF', name: 'Performance', type: 'NFR' });
    });

    it('maps requirement responses and keeps absent project identity explicit', () => {
        expect(
            mapRequirement({
                id: 'req-1',
                visibleKey: 'FR-UX-0001',
                type: 'FR',
                categoryId: 'cat-1',
                sequenceNumber: 1,
                status: 'draft',
                description: 'Usable',
                priority: 'P2',
                owner: null,
                rationale: null,
                source: null,
                rejectionReason: null,
                reviewer: null,
                rejectedAt: null,
                deletedAt: null,
                approvedAt: null,
                implementedAt: null,
                obsolescenceReason: null,
                obsoleteAt: null,
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
            }).projectId,
        ).toBeNull();
    });

    it('distinguishes central API error kinds', () => {
        expect(
            mapApiError(Object.assign(new Error('bad'), { status: 400, info: { message: ['name is required'] } })),
        ).toEqual({ kind: 'validation', message: 'name is required' });
        expect(mapApiError(Object.assign(new Error('duplicate'), { status: 409 }))).toEqual({
            kind: 'conflict',
            message: 'duplicate',
        });
        expect(mapApiError(new TypeError('fetch failed')).kind).toBe('network');
    });

    it('persists restored requirement tabs by IDs and labels only', () => {
        sessionStorage.setItem(
            WORKSPACE_STATE_KEY,
            JSON.stringify({
                ...initialWorkspaceState,
                openRequirementTabs: [{ id: 'req-tab-1', requirementId: '1', visibleKey: 'Loading requirement…' }],
            }),
        );
        const state = loadWorkspaceState();
        expect(state.openRequirementTabs).toEqual([
            { id: 'req-tab-1', requirementId: '1', visibleKey: 'Loading requirement…' },
        ]);
        saveWorkspaceState(state);
        expect(sessionStorage.getItem(WORKSPACE_STATE_KEY)).not.toContain('description');
    });
});
