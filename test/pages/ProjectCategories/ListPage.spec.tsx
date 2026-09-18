import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as CategoriesApiModule from '@/api/categoriesApi';
import type { Category } from '@/api/categoriesApi';
import { ListPage } from '@/pages/ProjectCategories/List/ListPage';
import { clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

const categories: readonly Category[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        projectId: '22222222-2222-4222-8222-222222222222',
        name: 'Authentication',
        key: 'AUTH',
        type: 'FR',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-29T11:30:00.000Z',
        requirementCount: 3,
    },
    {
        id: '33333333-3333-4333-8333-333333333333',
        projectId: '22222222-2222-4222-8222-222222222222',
        name: 'Performance',
        key: 'PERF',
        type: 'NFR',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-29T11:30:00.000Z',
        requirementCount: 2,
    },
    {
        id: '44444444-4444-4444-8444-444444444444',
        projectId: '22222222-2222-4222-8222-222222222222',
        name: 'Validation',
        key: 'VAL',
        type: 'FR',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-29T11:30:00.000Z',
        requirementCount: 0,
    },
];

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    getProjectCategoriesCollection: vi.fn((projectId: string) => ({ id: `categories:${projectId}` })),
    deleteProjectCategoryRequest: vi.fn(),
    getListProjectCategoriesQueryKey: vi.fn((projectId: string) => [`/projects/${projectId}/categories`] as const),
    invalidateQueries: vi.fn(),
    openTab: vi.fn(),
    showToastMessage: vi.fn(),
}));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery }));
vi.mock('@/api/collections/projectCategoriesCollection', () => ({
    getProjectCategoriesCollection: mocks.getProjectCategoriesCollection,
}));
vi.mock('@/api/categoriesApi', async (importOriginal) => {
    const original = await importOriginal<typeof CategoriesApiModule>();

    return {
        ...original,
        deleteProjectCategoryRequest: mocks.deleteProjectCategoryRequest,
        getListProjectCategoriesQueryKey: mocks.getListProjectCategoriesQueryKey,
    };
});
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/stores/tabBarStore', () => ({ openTab: mocks.openTab }));
vi.mock('@/components/Feedback/toastEvents', () => ({ showToastMessage: mocks.showToastMessage }));

type QueryResult = Readonly<{ data?: readonly Category[]; isLoading: boolean; isError: boolean }>;

const clipboardWriteText = vi.fn<(text: string) => Promise<void>>();

function getTableRowByCellText(text: string): HTMLTableRowElement {
    const table = screen.getByRole('table');
    const cell = within(table).getByText(text);
    const row = cell.closest('tr');

    if (!(row instanceof HTMLTableRowElement)) {
        throw new Error(`Could not find a table row for cell text "${text}".`);
    }

    return row;
}

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{`${location.pathname}${location.search}`}</output>;
}

beforeEach(() => {
    setAuthenticatedSession({
        accessToken: 'requirements-engineer-token',
        user: {
            id: '11111111-1111-4111-8111-111111111111',
            username: 'requirements-engineer',
            email: 'requirements-engineer@example.org',
            displayName: 'Requirements Engineer',
            status: 'active',
            role: 'requirements_engineer',
            projectMemberships: [{ projectId: 'project-alpha' }],
        },
    });
    clipboardWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboardWriteText } });
    mocks.deleteProjectCategoryRequest.mockResolvedValue(undefined);
    mocks.invalidateQueries.mockResolvedValue(undefined);
});

function renderCategoriesListPage(queryResult?: Partial<QueryResult>): ReturnType<typeof render> {
    if (queryResult !== undefined) {
        mocks.useLiveQuery.mockReturnValue({ data: [], isLoading: false, isError: false, ...queryResult });
    }

    return render(
        <MemoryRouter initialEntries={['/projects/project-alpha/categories']}>
            <Routes>
                <Route
                    path='/projects/:projectId/categories'
                    element={
                        <>
                            <ListPage />
                            <LocationProbe />
                        </>
                    }
                />
                <Route
                    path='/projects/:projectId/categories/:categoryId/edit'
                    element={<LocationProbe />}
                />
                <Route
                    path='/projects/:projectId/requirements/new'
                    element={<LocationProbe />}
                />
                <Route
                    path='/projects/:projectId/requirements'
                    element={<LocationProbe />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
    vi.clearAllMocks();
});

describe('ProjectCategories ListPage', () => {
    it('renders category keys as copy links.', () => {
        renderCategoriesListPage({ data: categories });

        expect(screen.getByRole('link', { name: /copy category key auth/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /copy category key perf/i })).toBeInTheDocument();
    });

    it('renders requirement counts from the category summaries.', () => {
        renderCategoriesListPage({ data: categories });

        expect(getTableRowByCellText('Authentication')).toHaveTextContent('3');
        expect(getTableRowByCellText('Performance')).toHaveTextContent('2');
        expect(getTableRowByCellText('Validation')).toHaveTextContent('0');
    });

    it('copies the category key when the key cell is clicked.', async () => {
        renderCategoriesListPage({ data: categories });

        fireEvent.click(screen.getByRole('link', { name: /copy category key auth/i }));

        await waitFor(() => {
            expect(clipboardWriteText).toHaveBeenCalledWith('AUTH');
        });
        expect(mocks.showToastMessage).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Category key copied',
            detail: 'AUTH has been copied to the clipboard.',
            life: 3000,
        });
    });

    it('shows the category context menu actions on right click.', async () => {
        renderCategoriesListPage({ data: categories });

        fireEvent.contextMenu(getTableRowByCellText('Authentication'));

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Add requirement')).toBeInTheDocument();
    });

    it('deletes the selected category from the context menu when it has no requirements.', async () => {
        const user = userEvent.setup();

        renderCategoriesListPage({ data: categories });

        fireEvent.contextMenu(getTableRowByCellText('Validation'));
        await user.click(await screen.findByText('Delete'));
        await user.click(await screen.findByRole('button', { name: 'OK' }));

        await waitFor(() => {
            expect(mocks.deleteProjectCategoryRequest).toHaveBeenCalledWith(
                'project-alpha',
                '44444444-4444-4444-8444-444444444444',
            );
        });
        expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['/projects/project-alpha/categories'] });
        expect(mocks.showToastMessage).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Category deleted',
            detail: 'VAL has been deleted.',
            life: 3000,
        });
    });

    it('does not delete a category with requirements from the context menu.', async () => {
        renderCategoriesListPage({ data: categories });

        fireEvent.contextMenu(getTableRowByCellText('Authentication'));
        const deleteMenuItem = await screen.findByText('Delete');

        expect(deleteMenuItem.closest('[aria-disabled="true"]')).not.toBeNull();

        expect(mocks.deleteProjectCategoryRequest).not.toHaveBeenCalled();
    });

    it('navigates to the requirement creation placeholder from the context menu.', async () => {
        const user = userEvent.setup();

        renderCategoriesListPage({ data: categories });

        fireEvent.contextMenu(getTableRowByCellText('Authentication'));
        await user.click(await screen.findByText('Add requirement'));

        expect(screen.getByLabelText('Current route')).toHaveTextContent(
            '/projects/project-alpha/requirements/new?categoryId=11111111-1111-4111-8111-111111111111',
        );
    });
});
