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
