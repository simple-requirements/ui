import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
    assertImmutableRequirementFields,
    categoryOptionLabel,
    isRequirementEditable,
    synchronizeRequirementFromServer,
    toCreateRequirementRequest,
    toUpdateRequirementRequest,
} from '@/features/requirements/requirementForms';
import type { Category, RequirementView } from '@/types/domain';
import { deriveProjectAvailability } from '@/features/projects/projectAvailability';
import { mapRevisionHistoryError } from '@/api/errors/userSafeError';
import { ProjectCreationUnavailableError } from '@/utils/projectQueries';

const requirement: RequirementView = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: null,
    visibleKey: 'FR-AUTH-0001',
    categoryId: '22222222-2222-4222-8222-222222222222',
    categoryKey: 'AUTH',
    categoryName: 'Authentication',
    type: 'FR',
    description: 'The system shall authenticate users.',
    priority: 'P1',
    status: 'draft',
    owner: null,
    rationale: null,
    source: null,
};

describe('requirement form mapping', () => {
    it('creates API requests without title, type, key, status, or project selector values', () => {
        const request = toCreateRequirementRequest({
            categoryId: '22222222-2222-4222-8222-222222222222',
            description: 'The system shall authenticate users.',
            priority: 'P1',
            owner: '',
            rationale: '  ',
            source: 'Stakeholder',
        });
        expect(request).toEqual({
            categoryId: '22222222-2222-4222-8222-222222222222',
            description: 'The system shall authenticate users.',
            priority: 'P1',
            owner: null,
            rationale: null,
            source: 'Stakeholder',
        });
        expect(request).not.toHaveProperty('title');
        expect(request).not.toHaveProperty('type');
        expect(request).not.toHaveProperty('visibleKey');
        expect(request).not.toHaveProperty('status');
        expect(request).not.toHaveProperty('projectId');
    });

    it('updates only draft-editable fields and normalizes optional empty strings', () => {
        const request = toUpdateRequirementRequest({
            description: 'Changed',
            priority: 'P2',
            owner: '',
            rationale: 'Because',
            source: '',
        });
        expect(request).toEqual({
            description: 'Changed',
            priority: 'P2',
            owner: null,
            rationale: 'Because',
            source: null,
        });
        expect(request).not.toHaveProperty('categoryId');
        expect(request).not.toHaveProperty('type');
        expect(request).not.toHaveProperty('visibleKey');
        expect(request).not.toHaveProperty('status');
        expect(request).not.toHaveProperty('id');
    });

    it('uses generated zod request validation', () => {
        expect(() => toCreateRequirementRequest({ ...requirement, categoryId: 'not-a-uuid' })).toThrow();
    });
});

describe('requirement domain helpers', () => {
    it('formats category options with key, name, and derived type', () => {
        const category: Category = { id: 'cat', key: 'AUTH', name: 'Authentication', type: 'FR' };
        expect(categoryOptionLabel(category)).toBe('AUTH — Authentication — FR');
    });

    it('allows editing drafts only', () => {
        expect(isRequirementEditable('draft')).toBe(true);
        expect(isRequirementEditable('approved')).toBe(false);
        expect(isRequirementEditable('deleted')).toBe(false);
    });

    it('rejects immutable-field response changes', () => {
        expect(() =>
            assertImmutableRequirementFields(requirement, { ...requirement, visibleKey: 'FR-AUTH-0002' }),
        ).toThrow(/immutable/);
    });

    it('updates detail cache and invalidates project counts only after creation', async () => {
        const queryClient = new QueryClient();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        await synchronizeRequirementFromServer({ requirement, projectId: 'project-1', reason: 'created', queryClient });
        expect(queryClient.getQueryData(['requirements', 'detail', requirement.id])).toEqual(requirement);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['requirements', 'list', 'project-1'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['projects'] });

        invalidateSpy.mockClear();
        await synchronizeRequirementFromServer({ requirement, projectId: 'project-1', reason: 'updated', queryClient });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['requirements', 'list', 'project-1'] });
        expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['projects'] });
    });
});

describe('project availability', () => {
    const projects = [{ id: 'project-beta', name: 'Customer Portal', requirementCount: 12 }];

    it('treats a selected loaded project as available', () => {
        expect(deriveProjectAvailability('project-beta', projects, false)).toMatchObject({
            state: 'available',
            canUseProject: true,
            activeProject: projects[0],
        });
    });

    it('keeps no selection, loading, and stale route states distinct', () => {
        expect(deriveProjectAvailability(null, projects, false).message).toBe('Select a project to continue.');
        expect(deriveProjectAvailability('missing', projects, true).state).toBe('loading');
        expect(deriveProjectAvailability('missing', projects, false).state).toBe('unavailable');
    });
});

describe('user-safe error mapping', () => {
    it('hides internal configuration variable names in revision history errors', () => {
        const mapped = mapRevisionHistoryError(new Error('Missing VITE_API_BASE_URL. Configure the backend.'));
        expect(mapped.message).toBe('Revision history is currently unavailable. Please try again later.');
        expect(mapped.message).not.toContain('VITE_API_BASE_URL');
        expect(mapped.retryable).toBe(false);
    });
});

describe('project creation error safety', () => {
    it('uses a user-safe message for the missing backend project creation contract', () => {
        const error = new ProjectCreationUnavailableError();
        expect(error.message).toBe('Project creation is currently unavailable.');
        expect(error.message).not.toContain('openapi/backend-api.json');
        expect(error.message).not.toContain('POST /projects');
    });
});
