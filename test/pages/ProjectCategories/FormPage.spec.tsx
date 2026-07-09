import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, RouterProvider, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as CategoriesApiModule from '@/api/categoriesApi';
import type { Category } from '@/api/categoriesApi';
import { FormPage } from '@/pages/ProjectCategories/Form/FormPage';

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

const performanceCategory: Category = {
    ...category,
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Performance',
    key: 'PERF',
    type: 'NFR',
};

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    getProjectCategoriesCollection: vi.fn((projectId: string) => ({ id: `categories:${projectId}` })),
    createProjectCategoryRequest: vi.fn(),
    updateProjectCategoryRequest: vi.fn(),
    invalidateQueries: vi.fn(),
    openTab: vi.fn(),
    showToastMessage: vi.fn(),
}));

vi.mock('@tanstack/react-db', () => ({ eq: vi.fn(), useLiveQuery: mocks.useLiveQuery }));

vi.mock('@/api/collections/projectCategoriesCollection', () => ({
    getProjectCategoriesCollection: mocks.getProjectCategoriesCollection,
}));

vi.mock('@/api/categoriesApi', async (importOriginal) => {
    const actual = await importOriginal<typeof CategoriesApiModule>();

    return {
        ...actual,
        createProjectCategoryRequest: mocks.createProjectCategoryRequest,
        updateProjectCategoryRequest: mocks.updateProjectCategoryRequest,
    };
});

vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/stores/tabBarStore', () => ({ openTab: mocks.openTab }));
vi.mock('@/stores/toastStore', () => ({ showToastMessage: mocks.showToastMessage }));

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

type QueryOptions = Readonly<{
    categories?: readonly Category[];
    category?: Category;
    categoryLoading?: boolean;
    categoryError?: boolean;
}>;

function mockQueries({
    categories = [category],
    category: selectedCategory,
    categoryLoading = false,
    categoryError = false,
}: QueryOptions = {}): void {
    let callIndex = 0;

    mocks.useLiveQuery.mockImplementation(() => {
        const queryIndex = callIndex % 2;
        callIndex += 1;

        if (queryIndex === 0) {
            return { data: categories, isLoading: false, isError: false };
        }

        return { data: selectedCategory, isLoading: categoryLoading, isError: categoryError };
    });
}

function renderFormPage(initialEntry: string): ReturnType<typeof render> {
    const router = createMemoryRouter(
        [
            {
                path: '/projects/:projectId/categories/new',
                element: (
                    <>
                        <FormPage />
                        <LocationProbe />
                    </>
                ),
            },
            {
                path: '/projects/:projectId/categories/:categoryId/edit',
                element: (
                    <>
                        <FormPage />
                        <LocationProbe />
                    </>
                ),
            },
            { path: '/projects/:projectId/categories', element: <LocationProbe /> },
            { path: '/projects/:projectId/categories/:categoryId', element: <LocationProbe /> },
            { path: '/projects/:projectId/requirements', element: <LocationProbe /> },
        ],
        { initialEntries: [initialEntry] },
    );

    return render(<RouterProvider router={router} />);
}

beforeEach(() => {
    mockQueries();
    mocks.createProjectCategoryRequest.mockResolvedValue(category);
    mocks.updateProjectCategoryRequest.mockResolvedValue(category);
    mocks.invalidateQueries.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe('ProjectCategories FormPage', () => {
    it('renders the create form with editable category fields.', () => {
        mockQueries({ categories: [] });

        renderFormPage('/projects/project-alpha/categories/new');

        expect(screen.getByRole('heading', { name: 'Create category' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeEnabled();
        expect(screen.getByRole('textbox', { name: 'Key' })).toBeEnabled();
        expect(screen.getByRole('combobox', { name: 'Type' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abort' })).toBeInTheDocument();
    });

    it('creates a category, opens a details tab, navigates to details, and shows a Toast message.', async () => {
        const user = userEvent.setup();
        const createdCategory: Category = { ...performanceCategory, name: 'User interface', key: 'UI' };

        mockQueries({ categories: [] });
        mocks.createProjectCategoryRequest.mockResolvedValue(createdCategory);

        renderFormPage('/projects/project-alpha/categories/new');

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'User interface');
        await user.type(screen.getByRole('textbox', { name: 'Key' }), 'ui');
        await user.selectOptions(screen.getByRole('combobox', { name: 'Type' }), 'NFR');
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mocks.createProjectCategoryRequest).toHaveBeenCalledWith('project-alpha', {
                name: 'User interface',
                key: 'UI',
                type: 'NFR',
            });
        });

        expect(mocks.showToastMessage).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Category created',
            detail: 'UI has been created.',
            life: 3000,
        });
        expect(mocks.openTab).toHaveBeenCalledWith({
            id: '/projects/project-alpha/categories/33333333-3333-4333-8333-333333333333',
            label: 'Category UI',
            closable: true,
        });
        expect(await screen.findByLabelText('Current route')).toHaveTextContent(
            '/projects/project-alpha/categories/33333333-3333-4333-8333-333333333333',
        );
    });

    it('validates required and unique create fields.', async () => {
        const user = userEvent.setup();

        mockQueries({ categories: [category] });
        renderFormPage('/projects/project-alpha/categories/new');

        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(await screen.findByText('Name is required.')).toBeInTheDocument();
        expect(screen.getByText('Key must contain 2 to 4 uppercase letters.')).toBeInTheDocument();
        expect(mocks.createProjectCategoryRequest).not.toHaveBeenCalled();

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Authentication');
        await user.type(screen.getByRole('textbox', { name: 'Key' }), 'AUTH');
        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(await screen.findByText('Name must be unique within the project.')).toBeInTheDocument();
        expect(mocks.createProjectCategoryRequest).not.toHaveBeenCalled();
    });

    it('renders the update form with read-only key and locked type.', () => {
        mockQueries({ categories: [category], category });

        renderFormPage('/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111/edit');

        expect(screen.getByRole('heading', { name: 'Update category' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Authentication');
        expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('AUTH');
        expect(screen.getByRole('textbox', { name: 'Key' })).toHaveAttribute('readonly');
        expect(screen.getByRole('combobox', { name: 'Type' })).toBeDisabled();
    });

    it('uses the category details tab while editing a category.', async () => {
        mockQueries({ categories: [category], category });

        renderFormPage('/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111/edit');

        await waitFor(() => {
            expect(mocks.openTab).toHaveBeenCalledWith({
                id: '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111',
                label: 'Category AUTH',
                closable: true,
            });
        });
        expect(mocks.openTab).not.toHaveBeenCalledWith({
            id: '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111/edit',
            label: 'Edit Category AUTH',
            closable: true,
        });
    });

    it('updates only the category name.', async () => {
        const user = userEvent.setup();

        mockQueries({ categories: [category], category });
        mocks.updateProjectCategoryRequest.mockResolvedValue({ ...category, name: 'Login' });

        renderFormPage('/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111/edit');

        await user.clear(screen.getByRole('textbox', { name: 'Name' }));
        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Login');
        await user.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() => {
            expect(mocks.updateProjectCategoryRequest).toHaveBeenCalledWith(
                'project-alpha',
                '11111111-1111-4111-8111-111111111111',
                { name: 'Login' },
            );
        });
        expect(mocks.openTab).toHaveBeenCalledWith({
            id: '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111',
            label: 'Category AUTH',
            closable: true,
        });
        expect(await screen.findByLabelText('Current route')).toHaveTextContent(
            '/projects/project-alpha/categories/11111111-1111-4111-8111-111111111111',
        );
    });

    it('asks for confirmation before aborting a dirty form.', async () => {
        const user = userEvent.setup();

        mockQueries({ categories: [] });
        renderFormPage('/projects/project-alpha/categories/new');

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Authentication');
        await user.click(screen.getByRole('button', { name: 'Abort' }));

        expect(screen.getByRole('dialog', { name: /discard unsaved changes/i })).toBeInTheDocument();
        expect(screen.getByText('Your input will be lost. Do you want to continue?')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Stay on page' }));

        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/categories/new');
    });

    it('blocks route changes from a dirty form until the user confirms.', async () => {
        const user = userEvent.setup();

        mockQueries({ categories: [] });

        const router = createMemoryRouter(
            [
                {
                    path: '/projects/:projectId/categories/new',
                    element: (
                        <>
                            <Link to='/projects/project-alpha/requirements'>Requirements</Link>
                            <FormPage />
                            <LocationProbe />
                        </>
                    ),
                },
                { path: '/projects/:projectId/requirements', element: <LocationProbe /> },
            ],
            { initialEntries: ['/projects/project-alpha/categories/new'] },
        );

        render(<RouterProvider router={router} />);

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Authentication');
        await user.click(screen.getByRole('link', { name: 'Requirements' }));

        expect(await screen.findByRole('dialog', { name: /discard unsaved changes/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/categories/new');

        await user.click(screen.getByRole('button', { name: 'Stay on page' }));

        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/categories/new');
    });
});
