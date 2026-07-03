import { afterEach, describe, expect, it, vi } from 'vitest';

import { categorySchema, getListProjectCategoriesQueryKey, listProjectCategoriesRequest } from '@/api/categoriesApi';
import type * as FetchModule from '@/api/fetch';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();

    return { ...actual, apiFetch: mocks.apiFetch };
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('categoriesApi', () => {
    it('creates the list query key.', () => {
        expect(getListProjectCategoriesQueryKey('project-alpha')).toEqual(['/projects', 'project-alpha', 'categories']);
    });

    it('defaults a missing requirement count to zero.', () => {
        const category = categorySchema.parse({
            id: '11111111-1111-4111-8111-111111111111',
            projectId: '22222222-2222-4222-8222-222222222222',
            name: 'Authentication',
            key: 'AUTH',
            type: 'FR',
            createdAt: '2026-06-28T10:00:00.000Z',
            updatedAt: '2026-06-29T11:30:00.000Z',
        });

        expect(category.requirementCount).toBe(0);
    });

    it('lists and parses project categories.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    projectId: '22222222-2222-4222-8222-222222222222',
                    name: 'Authentication',
                    key: 'AUTH',
                    type: 'FR',
                    createdAt: '2026-06-28T10:00:00.000Z',
                    updatedAt: '2026-06-29T11:30:00.000Z',
                },
            ],
            status: 200,
            headers: new Headers(),
        });

        await expect(listProjectCategoriesRequest('project alpha')).resolves.toEqual([
            {
                id: '11111111-1111-4111-8111-111111111111',
                projectId: '22222222-2222-4222-8222-222222222222',
                name: 'Authentication',
                key: 'AUTH',
                type: 'FR',
                createdAt: '2026-06-28T10:00:00.000Z',
                updatedAt: '2026-06-29T11:30:00.000Z',
                requirementCount: 0,
            },
        ]);

        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project%20alpha/categories');
    });
});
