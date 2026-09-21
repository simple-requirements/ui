import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import type { Requirement } from '@/api/requirementsApi';
import { RevisionComparisonPanel } from '@/pages/ProjectRequirements/RevisionComparisonPanel';

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

const revisions: Requirement[] = [1, 2, 3].map((revisionNumber) => ({
    ...baseRevision,
    revisionNumber,
    changeType: revisionNumber === 1 ? 'requirement_created' : 'content_changed',
    changeReason: revisionNumber === 1 ? 'Requirement created.' : `Revision ${revisionNumber}.`,
    changedAt: `2026-09-2${revisionNumber - 1}T08:00:00.000Z`,
    changedByUserId: null,
    changedByDisplayName: 'System',
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('RevisionComparisonPanel', () => {
    it('compares the previous revision with the current revision by default and supports another selection', () => {
        mocks.useQuery.mockImplementation(({ queryKey }: Readonly<{ queryKey: readonly unknown[] }>) => {
            const params = queryKey[1] as Readonly<{ from: number; to: number }> | undefined;
            return {
                data: {
                    fromRevision: params?.from ?? 2,
                    toRevision: params?.to ?? 3,
                    differences: [
                        { field: 'description', from: 'Old description', to: 'New description' },
                        {
                            field: 'implementationTickets',
                            from: [],
                            to: [{ ticketId: 'AUTH-42', completedBy: 'Ada Engineer', completedAt: '2026-09-21' }],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            };
        });

        render(
            <RevisionComparisonPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={revisions}
            />,
        );

        expect(screen.getByLabelText('From revision')).toHaveValue('2');
        expect(screen.getByLabelText('To revision')).toHaveValue('3');
        expect(screen.getByRole('columnheader', { name: 'Revision 2' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Revision 3' })).toBeInTheDocument();
        expect(screen.getByRole('rowheader', { name: 'Description' })).toBeInTheDocument();
        expect(screen.getByText('AUTH-42 — Ada Engineer · 2026-09-21')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('From revision'), { target: { value: '1' } });

        expect(screen.getByLabelText('From revision')).toHaveValue('1');
        expect(mocks.useQuery).toHaveBeenLastCalledWith(
            expect.objectContaining({
                queryKey: [
                    '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/revisions/compare',
                    { from: 1, to: 3 },
                ],
            }),
        );
    });

    it('shows comparison loading and error states', () => {
        mocks.useQuery.mockReturnValueOnce({ data: undefined, isLoading: true, isError: false });
        const { rerender } = render(
            <RevisionComparisonPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={revisions}
            />,
        );
        expect(screen.getByText('Comparing revisions …')).toBeInTheDocument();

        mocks.useQuery.mockReturnValueOnce({ data: undefined, isLoading: false, isError: true });
        rerender(
            <RevisionComparisonPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={revisions}
            />,
        );
        expect(screen.getByText('Revision comparison could not be loaded.')).toBeInTheDocument();
    });

    it('explains when there is only one revision to compare', () => {
        mocks.useQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });

        render(
            <RevisionComparisonPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={[revisions[0]]}
            />,
        );

        expect(screen.getByText('At least two revisions are required for comparison.')).toBeInTheDocument();
        expect(screen.queryByLabelText('From revision')).not.toBeInTheDocument();
    });

    it('shows a no-differences state', () => {
        mocks.useQuery.mockReturnValue({
            data: { fromRevision: 2, toRevision: 3, differences: [] },
            isLoading: false,
            isError: false,
        });

        render(
            <RevisionComparisonPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={revisions}
            />,
        );

        const comparison = screen.getByText('No differences between the selected revisions.');
        expect(comparison).toBeInTheDocument();
        expect(within(comparison.parentElement ?? document.body).queryByRole('table')).not.toBeInTheDocument();
    });
});
