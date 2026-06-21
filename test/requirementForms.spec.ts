import { deriveProjectAvailability } from '@/features/projects/projectAvailability';
import {
    assertImmutableRequirementFields,
    categoryOptionLabel,
    isRequirementEditable,
    toCreateRequirementRequest,
    toUpdateRequirementRequest,
    type RequirementFormValues,
} from '@/features/requirements/requirementForms';
import type { Category, RequirementView } from '@/types/domain';
import { describe, expect, it } from 'vitest';

const requirement: RequirementView = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '33333333-3333-4333-8333-333333333333',
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
            projectId: '33333333-3333-4333-8333-333333333333',
            categoryId: '22222222-2222-4222-8222-222222222222',
            description: 'The system shall authenticate users.',
            priority: 'P1',
            owner: '',
            rationale: '  ',
            source: 'Stakeholder',
        });
        expect(request).toEqual({
            projectId: '33333333-3333-4333-8333-333333333333',
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
        const validCreateValues = {
            projectId: requirement.projectId ?? undefined,
            categoryId: requirement.categoryId,
            description: requirement.description,
            priority: requirement.priority,
            owner: requirement.owner ?? '',
            rationale: requirement.rationale ?? '',
            source: requirement.source ?? '',
        } satisfies RequirementFormValues;

        expect(() => toCreateRequirementRequest({ ...validCreateValues, categoryId: 'not-a-uuid' })).toThrow();
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
