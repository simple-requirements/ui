import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/api/categoriesApi';
import type * as RequirementsApiModule from '@/api/requirementsApi';
import type { Requirement } from '@/api/requirementsApi';
import { FormPage } from '@/pages/ProjectRequirements/FormPage';

const category: Category = {
    id: '33333333-3333-4333-8333-333333333333',
    projectId: '22222222-2222-4222-8222-222222222222',
    name: 'Authentication',
    key: 'AUTH',
    type: 'FR',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
    requirementCount: 1,
};

const requirement: Requirement = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    categoryId: category.id,
    sequenceNumber: 1,
    revisionNumber: 2,
    visibleKey: 'FR-AUTH-0001',
    status: 'draft',
    description: 'Users can sign in.',
    priority: 'p1',
    owner: 'Alice',
    rationale: 'Authentication is required.',
    source: 'Security policy',
    rejectionReason: null,
    reviewer: null,
    rejectedAt: null,
    deletedAt: null,
    approvedAt: null,
    implementedAt: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
};

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    getProjectCategoriesCollection: vi.fn((projectId: string) => ({ id: `categories:${projectId}` })),
    getProjectRequirementsCollection: vi.fn((projectId: string) => ({ id: `requirements:${projectId}` })),
    createProjectRequirementRequest: vi.fn(),
    updateProjectRequirementRequest: vi.fn(),
    invalidateQueries: vi.fn(),
    openTab: vi.fn(),
    showToastMessage: vi.fn(),
}));

vi.mock('@tanstack/react-db', () => ({ eq: vi.fn(), useLiveQuery: mocks.useLiveQuery }));
vi.mock('@/api/collections/projectCategoriesCollection', () => ({
    getProjectCategoriesCollection: mocks.getProjectCategoriesCollection,
}));
vi.mock('@/api/collections/projectRequirementsCollection', () => ({
    getProjectRequirementsCollection: mocks.getProjectRequirementsCollection,
}));
vi.mock('@/api/requirementsApi', async (importOriginal) => {
    const actual = await importOriginal<typeof RequirementsApiModule>();

    return {
        ...actual,
        createProjectRequirementRequest: mocks.createProjectRequirementRequest,
        updateProjectRequirementRequest: mocks.updateProjectRequirementRequest,
    };
});
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/stores/tabBarStore', () => ({ openTab: mocks.openTab }));
vi.mock('@/stores/toastStore', () => ({ showToastMessage: mocks.showToastMessage }));

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

type QueryOptions = Readonly<{ categories?: readonly Category[]; selectedRequirement?: Requirement }>;

function mockQueries({ categories = [category], selectedRequirement }: QueryOptions = {}): void {
    let callIndex = 0;

    mocks.useLiveQuery.mockImplementation(() => {
        const queryIndex = callIndex % 2;
        callIndex += 1;

        if (queryIndex === 0) {
            return { data: categories, isLoading: false, isError: false };
        }

        return { data: selectedRequirement, isLoading: false, isError: false };
    });
}

function renderRequirementFormPage(initialEntry: string): ReturnType<typeof render> {
    const router = createMemoryRouter(
        [
            {
                path: '/projects/:projectId/requirements/new',
                element: (
                    <>
                        <FormPage />
                        <LocationProbe />
                    </>
                ),
            },
            {
                path: '/projects/:projectId/requirements/:requirementId/edit',
                element: (
                    <>
                        <FormPage />
                        <LocationProbe />
                    </>
                ),
            },
            { path: '/projects/:projectId/requirements', element: <LocationProbe /> },
            { path: '/projects/:projectId/requirements/:requirementId', element: <LocationProbe /> },
        ],
        { initialEntries: [initialEntry] },
    );

    return render(<RouterProvider router={router} />);
}

beforeEach(() => {
    mockQueries();
    mocks.createProjectRequirementRequest.mockResolvedValue(requirement);
    mocks.updateProjectRequirementRequest.mockResolvedValue(requirement);
    mocks.invalidateQueries.mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectRequirements FormPage', () => {
    it('renders the create requirement form with the selected category preselected.', () => {
        renderRequirementFormPage(`/projects/project-alpha/requirements/new?categoryId=${category.id}`);

        expect(screen.getByRole('heading', { name: /create requirement/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toHaveValue(category.id);
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('creates a requirement and navigates to the details route.', async () => {
        const user = userEvent.setup();

        renderRequirementFormPage(`/projects/project-alpha/requirements/new?categoryId=${category.id}`);

        await user.type(screen.getByLabelText('Description'), 'Users can sign in.');
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mocks.createProjectRequirementRequest).toHaveBeenCalledWith('project-alpha', {
                categoryId: category.id,
                description: 'Users can sign in.',
                priority: null,
                owner: null,
                rationale: null,
                source: null,
            });
        });
        expect(screen.getByLabelText('Current route')).toHaveTextContent(
            '/projects/project-alpha/requirements/11111111-1111-4111-8111-111111111111',
        );
    });

    it('renders the update requirement form with the current values.', () => {
        mockQueries({ selectedRequirement: requirement });

        renderRequirementFormPage('/projects/project-alpha/requirements/11111111-1111-4111-8111-111111111111/edit');

        expect(screen.getByRole('heading', { name: /update requirement/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toHaveValue(category.id);
        expect(screen.getByLabelText('Description')).toHaveValue('Users can sign in.');
        expect(screen.getByLabelText('Owner')).toHaveValue('Alice');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });
});
