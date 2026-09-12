import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Requirement } from '@/api/requirementsApi';
import { ListPage } from '@/pages/ProjectRequirements/List/ListPage';

const requirements: readonly Requirement[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        projectId: '22222222-2222-4222-8222-222222222222',
        categoryId: '33333333-3333-4333-8333-333333333333',
        sequenceNumber: 1,
        revisionNumber: 2,
        visibleKey: 'FR-AUTH-0001',
        status: 'approved',
        description: 'Users can sign in.',
        priority: 'p1',
        owner: 'Alice',
        rationale: 'Authentication is required.',
        source: 'Security policy',
        rejectionReason: null,
        reviewer: 'Bob',
        rejectedAt: null,
        deletedAt: null,
        approvedAt: '2026-06-29T11:00:00.000Z',
        implementedAt: null,
        obsoletedBy: null,
        obsolescenceReason: null,
        obsoleteAt: null,
        implementationTickets: [],
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-29T11:30:00.000Z',
    },
    {
        id: '44444444-4444-4444-8444-444444444444',
        projectId: '22222222-2222-4222-8222-222222222222',
        categoryId: '55555555-5555-4555-8555-555555555555',
        sequenceNumber: 1,
        revisionNumber: 1,
        visibleKey: 'NFR-PERF-0001',
        status: 'draft',
        description: 'The dashboard opens within one second.',
        priority: null,
        owner: null,
        rationale: null,
        source: null,
        rejectionReason: null,
        reviewer: null,
        rejectedAt: null,
        deletedAt: null,
        approvedAt: null,
        implementedAt: null,
        obsoletedBy: null,
        obsolescenceReason: null,
        obsoleteAt: null,
        implementationTickets: [],
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z',
    },
];

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    getProjectRequirementsCollection: vi.fn((projectId: string) => ({ id: `requirements:${projectId}` })),
    openTab: vi.fn(),
    showToastMessage: vi.fn(),
    getReviewSummary: vi.fn(),
}));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery }));
vi.mock('@/api/collections/projectRequirementsCollection', () => ({
    getProjectRequirementsCollection: mocks.getProjectRequirementsCollection,
}));
vi.mock('@/stores/tabBarStore', () => ({ openTab: mocks.openTab }));
vi.mock('@/stores/toastStore', () => ({ showToastMessage: mocks.showToastMessage }));
vi.mock('@/api/reviewApi', () => ({ getReviewSummary: mocks.getReviewSummary }));

type QueryResult = Readonly<{ data?: readonly Requirement[]; isLoading: boolean; isError: boolean }>;

const clipboardWriteText = vi.fn<(text: string) => Promise<void>>();

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

beforeEach(() => {
    mocks.getReviewSummary.mockResolvedValue({ commentCount: 0, openCommentCount: 0, state: 'not_started' });
    clipboardWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboardWriteText } });
});

function renderRequirementsListPage(queryResult: Partial<QueryResult> = {}): ReturnType<typeof render> {
    mocks.useLiveQuery.mockReturnValue({ data: [], isLoading: false, isError: false, ...queryResult });

    return render(
        <MemoryRouter initialEntries={['/projects/project-alpha/requirements']}>
            <Routes>
                <Route
                    path='/projects/:projectId/requirements'
                    element={
                        <>
                            <ListPage />
                            <LocationProbe />
                        </>
                    }
                />
                <Route
                    path='/projects/:projectId/requirements/:requirementId'
                    element={<LocationProbe />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectRequirements ListPage', () => {
    it('loads the requirements collection for the route project.', () => {
        renderRequirementsListPage();

        expect(mocks.getProjectRequirementsCollection).toHaveBeenCalledWith('project-alpha');
    });

    it('renders the current requirements table and details panel.', async () => {
        renderRequirementsListPage({ data: requirements });

        expect(screen.getByRole('heading', { name: 'Requirements' })).toBeInTheDocument();

        const table = screen.getByRole('table');
        expect(within(table).getByText('FR-AUTH-0001')).toBeInTheDocument();
        expect(within(table).getByText('NFR-PERF-0001')).toBeInTheDocument();
        expect(within(table).getByText('Users can sign in.')).toBeInTheDocument();
        expect(within(table).queryByRole('columnheader', { name: 'Revision' })).not.toBeInTheDocument();
        expect(within(table).getByText('Approved')).toBeInTheDocument();
        expect(within(table).getByText('Draft')).toBeInTheDocument();
        expect(within(table).getByText('Alice')).toBeInTheDocument();
        expect(within(table).getByText('Bob')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Requirement details' })).toBeInTheDocument();
            expect(screen.getByText('Security policy')).toBeInTheDocument();
        });
    });

    it('shows the selected requirement in the details panel when a row is clicked.', async () => {
        const user = userEvent.setup();

        renderRequirementsListPage({ data: requirements });

        await user.click(within(screen.getByRole('table')).getByText('The dashboard opens within one second.'));

        await waitFor(() => {
            expect(screen.getAllByText('NFR-PERF-0001')).toHaveLength(2);
            expect(screen.getAllByText('Draft')).not.toHaveLength(0);
        });
    });

    it('keeps the selected requirement visible when the selected row is clicked again.', async () => {
        const user = userEvent.setup();

        renderRequirementsListPage({ data: requirements });

        await waitFor(() => {
            expect(screen.getByText('Security policy')).toBeInTheDocument();
        });

        await user.click(within(screen.getByRole('table')).getByText('Users can sign in.'));

        await waitFor(() => {
            expect(screen.getByText('Security policy')).toBeInTheDocument();
            expect(screen.queryByText('Select a requirement to show its details.')).not.toBeInTheDocument();
        });
    });

    it('opens a requirement details tab and navigates when a row is double clicked.', async () => {
        const user = userEvent.setup();

        renderRequirementsListPage({ data: requirements });

        await user.dblClick(within(screen.getByRole('table')).getByText('Users can sign in.'));

        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent(
                '/projects/project-alpha/requirements/11111111-1111-4111-8111-111111111111',
            );
        });

        expect(mocks.openTab).toHaveBeenCalledWith({
            id: '/projects/project-alpha/requirements/11111111-1111-4111-8111-111111111111',
            label: 'FR-AUTH-0001',
            closable: true,
        });
    });

    it('copies the requirement key when the key cell is clicked.', async () => {
        const user = userEvent.setup();
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboardWriteText } });

        renderRequirementsListPage({ data: requirements });

        await user.click(screen.getByRole('button', { name: /copy requirement key fr-auth-0001/i }));

        expect(clipboardWriteText).toHaveBeenCalledTimes(1);
        expect(clipboardWriteText).toHaveBeenCalledWith('FR-AUTH-0001');
        expect(mocks.showToastMessage).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Requirement key copied',
            detail: 'FR-AUTH-0001 has been copied to the clipboard.',
            life: 3000,
        });
        expect(mocks.openTab).not.toHaveBeenCalled();
        expect(screen.getByText('Security policy')).toBeInTheDocument();
    });

    it('renders the loading state.', () => {
        renderRequirementsListPage({ isLoading: true });

        expect(screen.getByText(/loading requirements/i)).toBeInTheDocument();
    });

    it('renders the error state.', () => {
        renderRequirementsListPage({ isError: true });

        expect(screen.getByRole('alert')).toHaveTextContent('Requirements could not be loaded.');
    });

    it('renders the empty state.', () => {
        renderRequirementsListPage({ data: [] });

        expect(screen.getByText('No requirements available.')).toBeInTheDocument();
        expect(screen.getByText('Select a requirement to show its details.')).toBeInTheDocument();
    });
});
