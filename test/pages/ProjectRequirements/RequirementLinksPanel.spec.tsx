import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Requirement } from '@/api/requirementsApi';
import { RequirementLinksPanel } from '@/pages/ProjectRequirements/RequirementLinksPanel';

const mocks = vi.hoisted(() => ({
    useProjectPermissions: vi.fn(),
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useLiveQuery: vi.fn(),
    mutate: vi.fn(),
}));

vi.mock('@/auth/projectPermissions', () => ({ useProjectPermissions: mocks.useProjectPermissions }));
vi.mock('@tanstack/react-query', () => ({ useQuery: mocks.useQuery, useMutation: mocks.useMutation }));
vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery }));
vi.mock('@/api/collections/projectRequirementsCollection', () => ({
    getProjectRequirementsCollection: () => ({ id: 'requirements' }),
}));
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: vi.fn() } }));

const projectId = '11111111-1111-4111-8111-111111111111';
const source = {
    id: '22222222-2222-4222-8222-222222222222',
    projectId,
    visibleKey: 'FR-AUTH-0001',
    status: 'draft',
    implementationTickets: [],
} as Requirement;
const target = {
    id: '33333333-3333-4333-8333-333333333333',
    projectId,
    visibleKey: 'NFR-PERF-0001',
    status: 'approved',
    implementationTickets: [],
} as Requirement;

const link = {
    id: '44444444-4444-4444-8444-444444444444',
    projectId,
    relationshipType: 'references',
    source: {
        requirementId: source.id,
        visibleKey: source.visibleKey,
        type: 'FR',
        categoryId: '55555555-5555-4555-8555-555555555555',
        categoryName: 'Authentication',
        status: 'draft',
    },
    target: {
        requirementId: target.id,
        visibleKey: target.visibleKey,
        type: 'NFR',
        categoryId: '66666666-6666-4666-8666-666666666666',
        categoryName: 'Performance',
        status: 'approved',
    },
    createdAt: '2026-10-02T08:00:00.000Z',
    updatedAt: '2026-10-02T08:00:00.000Z',
} as const;

function renderPanel() {
    return render(
        <MemoryRouter>
            <RequirementLinksPanel
                projectId={projectId}
                requirement={source}
            />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mocks.useProjectPermissions.mockReturnValue({ canManageRequirements: false });
    mocks.useQuery.mockReturnValue({ data: { outgoing: [link], incoming: [] }, isLoading: false, isError: false });
    mocks.useLiveQuery.mockReturnValue({ data: [source, target], isLoading: false, isError: false });
    mocks.useMutation.mockReturnValue({ mutate: mocks.mutate, isPending: false });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('RequirementLinksPanel', () => {
    it('shows structured source/target metadata read-only for non-engineers.', () => {
        renderPanel();

        const panel = screen.getByRole('region', { name: 'Requirement links' });
        expect(panel).toHaveTextContent('FR-AUTH-0001');
        expect(panel).toHaveTextContent('NFR-PERF-0001');
        expect(panel).toHaveTextContent('NFR');
        expect(panel).toHaveTextContent('Performance');
        expect(panel).toHaveTextContent('Approved');
        expect(screen.queryByRole('button', { name: 'New link' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Correct' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    });

    it('shows outgoing mutation controls for Requirements Engineers.', () => {
        mocks.useProjectPermissions.mockReturnValue({ canManageRequirements: true });
        renderPanel();

        expect(screen.getByRole('button', { name: 'New link' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Correct' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('filters the overview by source or target visible key.', async () => {
        const user = userEvent.setup();
        renderPanel();

        const filter = screen.getByRole('textbox', { name: 'Filter by source or target' });
        await user.type(filter, 'PERF');
        expect(screen.getByText('NFR-PERF-0001')).toBeInTheDocument();

        await user.clear(filter);
        await user.type(filter, 'NO-MATCH');
        expect(screen.queryByText('NFR-PERF-0001')).not.toBeInTheDocument();
        expect(screen.getByText('No outgoing links.')).toBeInTheDocument();
    });
});
