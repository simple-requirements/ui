import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import { DetailsPage } from '@/pages/ProjectRequirements/DetailsPage';
import { actionBarStore } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({
    useLiveQuery: vi.fn(),
    useQuery: vi.fn(),
    eq: vi.fn(),
    openTab: vi.fn(),
    revisionOne: {
        id: 'requirement-1',
        visibleKey: 'FR-AUTH-0001',
        revisionNumber: 1,
        status: 'draft',
        implementationTickets: [],
    },
}));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery, eq: mocks.eq }));
vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactQueryModule>();

    return { ...actual, useQuery: mocks.useQuery };
});
vi.mock('@/api/collections/projectRequirementsCollection', () => ({ getProjectRequirementsCollection: () => ({}) }));
vi.mock('@/stores/tabBarStore', () => ({ openTab: mocks.openTab }));
vi.mock('@/pages/ProjectRequirements/RequirementDetailsPanel', () => ({
    RequirementDetailsPanel: ({ requirement, title }: Readonly<{ requirement?: { revisionNumber: number }; title: string }>) => (
        <>
            <h1>{title}</h1>
            <output aria-label='Displayed revision'>{requirement?.revisionNumber}</output>
        </>
    ),
}));
vi.mock('@/pages/ProjectRequirements/RevisionHistoryPanel', () => ({
    RevisionHistoryPanel: ({ onSelectRevision }: Readonly<{ onSelectRevision: (revision: unknown) => void }>) => (
        <section aria-label='Revision history'>
            <button type='button' onClick={() => onSelectRevision(mocks.revisionOne)}>Browse revision 1</button>
        </section>
    ),
}));
vi.mock('@/pages/ProjectRequirements/RequirementLinksPanel', () => ({
    RequirementLinksPanel: () => <section aria-label='Requirement links'>Requirement links</section>,
}));
vi.mock('@/pages/ProjectRequirements/ImplementationTicketsPanel', () => ({
    ImplementationTicketsPanel: ({ visible }: Readonly<{ visible: boolean }>) => (
        <output aria-label='Tickets visible'>{String(visible)}</output>
    ),
}));

const requirement = {
    id: 'requirement-1',
    visibleKey: 'FR-AUTH-0001',
    revisionNumber: 2,
    status: 'draft',
    implementationTickets: [],
};

function LocationProbe() {
    return <output aria-label='Location'>{useLocation().pathname}</output>;
}

function renderPage(initialEntry = '/projects/project-1/requirements/requirement-1') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <LocationProbe />
            <Routes>
                <Route
                    path='/projects/:projectId/requirements/:requirementId'
                    element={<DetailsPage />}
                />
                <Route
                    path='/projects/:projectId/requirements/:requirementId/review'
                    element={<h1>Review</h1>}
                />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mocks.useLiveQuery.mockReturnValue({ data: requirement, isLoading: false, isError: false });
    mocks.useQuery.mockReturnValue({ data: { state: 'not_started' }, isLoading: false, isError: false });
});

afterEach(() => {
    cleanup();
    actionBarStore.setState(() => ({ requirementKey: '' }));
    vi.clearAllMocks();
});

describe('Requirement DetailsPage', () => {
    it('publishes requirement context and opens a details tab', async () => {
        renderPage();

        expect(await screen.findByRole('heading', { name: 'FR-AUTH-0001' })).toBeInTheDocument();
        expect(mocks.openTab).toHaveBeenCalledWith(expect.objectContaining({ label: 'FR-AUTH-0001' }));
        expect(screen.getByRole('region', { name: 'Revision history' })).toBeInTheDocument();
        expect(actionBarStore.state.reviewActionRequirement).toEqual(
            expect.objectContaining({ requirementId: 'requirement-1' }),
        );
    });


    it('shows the selected historical revision in the details panel', async () => {
        renderPage();

        expect(await screen.findByLabelText('Displayed revision')).toHaveTextContent('2');
        expect(screen.getByRole('region', { name: 'Requirement links' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Browse revision 1' }));

        expect(screen.getByLabelText('Displayed revision')).toHaveTextContent('1');
        expect(screen.queryByRole('region', { name: 'Requirement links' })).not.toBeInTheDocument();
    });

    it('redirects a draft requirement to review when review activity has started', async () => {
        mocks.useQuery.mockReturnValue({ data: { state: 'in_review' }, isLoading: false, isError: false });
        renderPage();

        expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument();
        expect(screen.getByLabelText('Location')).toHaveTextContent(
            '/projects/project-1/requirements/requirement-1/review',
        );
    });

    it('shows an error when route identifiers are incomplete', async () => {
        render(
            <MemoryRouter initialEntries={['/incomplete']}>
                <Routes>
                    <Route
                        path='/incomplete'
                        element={<DetailsPage />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => expect(screen.getByText('Requirement route is incomplete.')).toBeInTheDocument());
    });
});
