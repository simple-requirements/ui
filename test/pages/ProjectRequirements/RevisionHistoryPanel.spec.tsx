import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import type { Requirement } from '@/api/requirementsApi';
import { RevisionHistoryPanel } from '@/pages/ProjectRequirements/RevisionHistoryPanel';

const mocks = vi.hoisted(() => ({ useQuery: vi.fn() }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactQueryModule>();
    return { ...actual, useQuery: mocks.useQuery };
});

const baseRevision = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    categoryId: '33333333-3333-4333-8333-333333333333',
    sequenceNumber: 1,
    visibleKey: 'FR-AUTH-0001',
    status: 'draft',
    description: 'Users can sign in.',
    priority: 'p1',
    owner: 'Alice',
    rationale: null,
    source: null,
    rejectionReason: null,
    reviewer: null,
    obsoletedBy: null,
    rejectedAt: null,
    approvedAt: null,
    implementedAt: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    implementationTickets: [],
    createdAt: '2026-09-20T08:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
} satisfies Omit<
    Requirement,
    'revisionNumber' | 'changeType' | 'changeReason' | 'changedAt' | 'changedByUserId' | 'changedByDisplayName'
>;

const revisions: Requirement[] = [
    {
        ...baseRevision,
        revisionNumber: 1,
        changeType: 'requirement_created',
        changeReason: 'Requirement created.',
        changedAt: '2026-09-20T08:00:00.000Z',
        changedByUserId: null,
        changedByDisplayName: 'System',
    },
    {
        ...baseRevision,
        revisionNumber: 2,
        changeType: 'content_changed',
        changeReason: 'Clarified authentication behavior.',
        changedAt: '2026-09-21T09:30:00.000Z',
        changedByUserId: '66666666-6666-4666-8666-666666666666',
        changedByDisplayName: 'Ada Engineer',
        updatedAt: '2026-09-21T09:30:00.000Z',
    },
];

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('RevisionHistoryPanel', () => {
    it('shows newest revisions first and highlights the current revision', () => {
        mocks.useQuery.mockReturnValue({ data: revisions, isLoading: false, isError: false });

        render(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={2}
            />,
        );

        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('Revision 2')).toBeInTheDocument();
        expect(rows[1]).toHaveClass('revision-history-panel__row--current');
        expect(within(rows[1]).queryByText('Current')).not.toBeInTheDocument();
        expect(within(rows[1]).getByText('Content changed')).toBeInTheDocument();
        expect(within(rows[1]).getByText('Clarified authentication behavior.')).toBeInTheDocument();
        expect(within(rows[1]).getByText('Ada Engineer')).toBeInTheDocument();
        expect(within(rows[2]).getByText('Revision 1')).toBeInTheDocument();
        expect(within(rows[2]).getByText('Requirement created')).toBeInTheDocument();

        expect(mocks.useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/revisions',
                ],
            }),
        );
    });

    it('shows loading, error, and empty states', () => {
        mocks.useQuery.mockReturnValueOnce({ data: undefined, isLoading: true, isError: false });
        const { rerender } = render(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={2}
            />,
        );
        expect(screen.getByText('Loading revision history …')).toBeInTheDocument();

        mocks.useQuery.mockReturnValueOnce({ data: undefined, isLoading: false, isError: true });
        rerender(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={2}
            />,
        );
        expect(screen.getByText('Revision history could not be loaded.')).toBeInTheDocument();

        mocks.useQuery.mockReturnValueOnce({ data: [], isLoading: false, isError: false });
        rerender(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={2}
            />,
        );
        expect(screen.getByText('No revision history is available for this requirement.')).toBeInTheDocument();
    });
});
