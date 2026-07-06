import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
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

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

function renderDetailsPage(): ReturnType<typeof render> {
    const router = createMemoryRouter(
        [
            {
                path: '/projects/:projectId/categories/:categoryId',
                element: (
                    <>
                        <DetailsPage />
                        <LocationProbe />
                    </>
                ),
            },
            { path: '/projects/:projectId/categories/:categoryId/edit', element: <LocationProbe /> },
        ],
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
    it('navigates to edit mode in the existing category details tab.', async () => {
        const user = userEvent.setup();

        renderDetailsPage();

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent(
                '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111/edit',
            );
        });
        expect(mocks.openTab).toHaveBeenCalledWith({
            id: '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111',
            label: 'Category AUTH',
            closable: true,
        });
        expect(mocks.openTab).not.toHaveBeenCalledWith({
            id: '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111/edit',
            label: 'Edit Category AUTH',
            closable: true,
        });
    });
});
