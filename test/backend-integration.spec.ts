import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl } from '@/api/client/config';
import { mapApiError } from '@/api/errors/apiError';
import { categoryKeys, projectKeys, requirementKeys } from '@/api/queryKeys';
import { mapCategory } from '@/features/categories/api/categoriesApi';
import { mapRequirement, validateVisibleKey } from '@/features/requirements/api/requirementsApi';
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

    it('maps requirement responses and keeps backend project identity explicit', () => {
        expect(
            mapRequirement({
                id: '11111111-1111-4111-8111-111111111111',
                visibleKey: 'FR-UX-0001',
                type: 'FR',
                categoryId: '22222222-2222-4222-8222-222222222222',
                projectId: '33333333-3333-4333-8333-333333333333',
                sequenceNumber: 1,
                status: 'draft',
                description: 'Usable',
                renderedDescription: 'Usable',
                metricReferences: [],
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
        ).toBe('33333333-3333-4333-8333-333333333333');
    });

    it('validates supported visible-key lookup formats', () => {
        expect(validateVisibleKey('FR-UI-0001')).toBe(true);
        expect(validateVisibleKey('NFR-PERF-0002')).toBe(true);
        expect(validateVisibleKey('fr-ui-0001')).toBe(true);
        expect(validateVisibleKey('FR-0001')).toBe(false);
        expect(validateVisibleKey('UI-0001')).toBe(false);
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
        expect(
            mapApiError(new Error('The backend connection is not configured. Please contact your administrator.'))
                .message,
        ).toBe('The backend connection is not configured. Please contact your administrator.');
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

describe('backend API configuration errors', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('uses a user-friendly message when the backend base URL is missing', () => {
        vi.stubEnv('VITE_API_BASE_URL', '');

        expect(() => getApiBaseUrl()).toThrow(
            'The backend connection is not configured. Please contact your administrator.',
        );
        expect(() => getApiBaseUrl()).not.toThrow(/VITE_API_BASE_URL/);
    });

    it('uses a user-friendly message when the backend base URL is invalid', () => {
        vi.stubEnv('VITE_API_BASE_URL', 'not a valid URL');

        expect(() => getApiBaseUrl()).toThrow(
            'The backend connection configuration is invalid. Please contact your administrator.',
        );
        expect(() => getApiBaseUrl()).not.toThrow(/VITE_API_BASE_URL/);
    });
});

import {
    classifyDifference,
    compareSources,
    makeCurrentSource,
    makeRevisionSource,
    mapRequirementRevision,
    shouldAcceptRevisionResponse,
    validateComparisonSources,
} from '@/features/requirements/revisions';

describe('requirement revision helpers', () => {
    const revisionDto = {
        id: '11111111-1111-4111-8111-111111111111',
        requirementId: '11111111-1111-4111-8111-111111111111',
        visibleKey: 'FR-UX-0001',
        type: 'FR' as const,
        projectId: '33333333-3333-4333-8333-333333333333',
        categoryId: '22222222-2222-4222-8222-222222222222',
        sequenceNumber: 1,
        status: 'draft' as const,
        description: 'Old description',
        renderedDescription: 'Old description',
        metricReferences: [],
        priority: 'P2',
        owner: null,
        rationale: '',
        source: 'Interview',
        rejectionReason: null,
        reviewer: null,
        rejectedAt: null,
        deletedAt: null,
        approvedAt: null,
        implementedAt: null,
        obsolescenceReason: null,
        obsoleteAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        revisionNumber: 2,
        requirementCreatedAt: '2026-01-01T00:00:00Z',
        requirementUpdatedAt: '2026-01-02T00:00:00Z',
    };

    it('maps immutable revision snapshots and preserves null versus empty values', () => {
        const revision = mapRequirementRevision(revisionDto);
        expect(revision).toMatchObject({
            requirementId: '11111111-1111-4111-8111-111111111111',
            revisionNumber: 2,
            readOnly: true,
            owner: null,
            rationale: '',
        });
    });

    it('classifies unchanged, added, removed, changed, and null-versus-empty differences', () => {
        expect(classifyDifference('P1', 'P1')).toBe('unchanged');
        expect(classifyDifference(null, 'Alice')).toBe('added');
        expect(classifyDifference('Alice', null)).toBe('removed');
        expect(classifyDifference('P2', 'P1')).toBe('changed');
        expect(classifyDifference(null, '')).toBe('added');
    });

    it('validates comparison sources and prevents same-source comparison', () => {
        const revision = mapRequirementRevision(revisionDto);
        expect(validateComparisonSources(makeRevisionSource(revision), makeRevisionSource(revision))).toBe(
            'Select two different comparison sources.',
        );
        expect(validateComparisonSources(makeCurrentSource(revision), makeRevisionSource(revision))).toBeNull();
    });

    it('compares current and historical sources field by field', () => {
        const revision = mapRequirementRevision(revisionDto);
        const current = { ...revision, description: 'New description', owner: 'Alice', source: null };
        const compared = compareSources(makeRevisionSource(revision), makeCurrentSource(current));
        expect(compared.find((field) => field.field === 'description')?.difference).toBe('changed');
        expect(compared.find((field) => field.field === 'owner')?.difference).toBe('added');
        expect(compared.find((field) => field.field === 'source')?.difference).toBe('removed');
    });

    it('guards stale revision detail responses by requirement and selected revision', () => {
        const revision = mapRequirementRevision(revisionDto);
        expect(shouldAcceptRevisionResponse('11111111-1111-4111-8111-111111111111', 2, revision)).toBe(true);
        expect(shouldAcceptRevisionResponse('33333333-3333-4333-8333-333333333333', 2, revision)).toBe(false);
        expect(shouldAcceptRevisionResponse('11111111-1111-4111-8111-111111111111', 3, revision)).toBe(false);
    });
});
