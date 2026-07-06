import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import type * as TanstackReactDb from '@tanstack/react-db';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FormPage } from '@/pages/ProjectRequirements/FormPage';

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    getProjectCategoriesCollection: vi.fn((projectId: string) => ({ id: `categories:${projectId}` })),
}));

vi.mock('@tanstack/react-db', async (importOriginal) => {
    const original = await importOriginal<typeof TanstackReactDb>();

    return { ...original, useLiveQuery: mocks.useLiveQuery };
});
vi.mock('@/api/collections/projectCategoriesCollection', () => ({
    getProjectCategoriesCollection: mocks.getProjectCategoriesCollection,
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

function renderRequirementFormPage(initialEntry = '/projects/project-alpha/requirements/new?categoryId=category-auth'): void {
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path='/projects/:projectId/requirements/new'
                    element={<FormPage />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

describe('ProjectRequirements FormPage', () => {
    it('shows the requirement creation placeholder with the selected category context.', () => {
        mocks.useLiveQuery.mockReturnValue({
            data: {
                id: 'category-auth',
                projectId: 'project-alpha',
                name: 'Authentication',
                key: 'AUTH',
                type: 'FR',
                createdAt: '2026-06-28T10:00:00.000Z',
                updatedAt: '2026-06-29T11:30:00.000Z',
                requirementCount: 0,
            },
            isLoading: false,
            isError: false,
        });

        renderRequirementFormPage();

        expect(screen.getByRole('heading', { name: /create requirement/i })).toBeInTheDocument();
        expect(screen.getByText(/requirement creation is not implemented yet/i)).toBeInTheDocument();
        expect(screen.getByText('AUTH')).toBeInTheDocument();
        expect(screen.getByText('Authentication')).toBeInTheDocument();
        expect(screen.getByText('FR')).toBeInTheDocument();
    });

    it('shows an info state when no category was selected.', () => {
        mocks.useLiveQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });

        renderRequirementFormPage('/projects/project-alpha/requirements/new');

        expect(screen.getByRole('status')).toHaveTextContent('No source category was selected.');
    });
});
