import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/api/categoriesApi';
import { DetailsPage } from '@/pages/ProjectCategories/DetailsPage';

const category: Category = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    name: 'Authentication',
    key: 'AUTH',
    type: 'FR',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
    requirementCount: 3,
};

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    getProjectCategoriesCollection: vi.fn((projectId: string) => ({ id: `categories:${projectId}` })),
    openTab: vi.fn(),
}));

vi.mock('@tanstack/react-db', () => ({ eq: vi.fn(), useLiveQuery: mocks.useLiveQuery }));

vi.mock('@/api/collections/projectCategoriesCollection', () => ({
    getProjectCategoriesCollection: mocks.getProjectCategoriesCollection,
}));

vi.mock('@/stores/tabBarStore', () => ({ openTab: mocks.openTab }));

function renderDetailsPage(): ReturnType<typeof render> {
    const router = createMemoryRouter(
        [{ path: '/projects/:projectId/categories/:categoryId', element: <DetailsPage /> }],
        { initialEntries: ['/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111'] },
    );

    return render(<RouterProvider router={router} />);
}

beforeEach(() => {
    mocks.useLiveQuery.mockReturnValue({ data: category, isLoading: false, isError: false });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectCategories DetailsPage', () => {
    it('keeps route actions out of the category detail panel.', () => {
        renderDetailsPage();

        expect(screen.getByRole('heading', { name: 'Category AUTH' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(mocks.openTab).toHaveBeenCalledWith({
            id: '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111',
            label: 'Category AUTH',
            closable: true,
        });
    });
});
