import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    categorySchema,
    createCategoryRequestSchema,
    createProjectCategoryRequest,
    getListProjectCategoriesQueryKey,
    listProjectCategoriesRequest,
    updateProjectCategoryRequest,
} from '@/api/categoriesApi';
import type * as FetchModule from '@/api/fetch';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();

    return { ...actual, apiFetch: mocks.apiFetch };
});

const categoryResponse = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    name: 'Authentication',
    key: 'AUTH',
    type: 'FR',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
};

afterEach(() => {
    vi.clearAllMocks();
});

describe('categoriesApi', () => {
    it('creates the generated list query key.', () => {
        expect(getListProjectCategoriesQueryKey('project-alpha')).toEqual(['/projects/project-alpha/categories']);
    });

    it('does not invent a missing requirement count.', () => {
        const category = categorySchema.parse(categoryResponse);

        expect(category.requirementCount).toBeUndefined();
    });

    it('normalizes create input.', () => {
        expect(createCategoryRequestSchema.parse({ name: ' Authentication ', key: 'auth', type: 'FR' })).toEqual({
            name: 'Authentication',
            key: 'AUTH',
            type: 'FR',
        });
    });

    it('lists and parses project categories through the generated API client.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: [categoryResponse], status: 200, headers: new Headers() });

        await expect(listProjectCategoriesRequest('project alpha')).resolves.toEqual([categoryResponse]);

        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project alpha/categories', { method: 'GET' });
    });

    it('creates a project category through the generated API client.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: categoryResponse, status: 201, headers: new Headers() });

        await expect(
            createProjectCategoryRequest('project alpha', { name: 'Authentication', key: 'AUTH', type: 'FR' }),
        ).resolves.toEqual(categoryResponse);

        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project alpha/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Authentication', key: 'AUTH', type: 'FR' }),
        });
    });

    it('updates a project category through the generated API client.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: { ...categoryResponse, name: 'Login' },
            status: 200,
            headers: new Headers(),
        });

        await expect(
            updateProjectCategoryRequest('project alpha', 'category auth', { name: 'Login' }),
        ).resolves.toEqual({ ...categoryResponse, name: 'Login' });

        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project alpha/categories/category auth', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Login' }),
        });
    });
});
