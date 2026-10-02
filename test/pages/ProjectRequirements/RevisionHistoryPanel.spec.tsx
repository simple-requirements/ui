import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ContextMenu } from 'primereact/contextmenu';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import type { Requirement } from '@/api/requirementsApi';
import { RevisionHistoryPanel } from '@/pages/ProjectRequirements/RevisionHistoryPanel';
import { actionBarStore } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({ useQuery: vi.fn() }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactQueryModule>();
    return { ...actual, useQuery: mocks.useQuery };
});

vi.mock('@/components/ContextMenu/AppContextMenu', async () => {
    const React = await import('react');

    return {
        AppContextMenu: React.forwardRef<
            ContextMenu,
            Readonly<{ model: readonly { label?: string; command?: () => void }[] }>
        >(function MockContextMenu({ model }, ref) {
            const [visible, setVisible] = React.useState(false);
            React.useImperativeHandle(ref, () => ({ show: () => setVisible(true) }) as unknown as ContextMenu);

            return visible ?
                    <nav aria-label='Revision context menu'>
                        {model.map((item) => (
                            <button
                                key={item.label}
                                type='button'
                                onClick={item.command}>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                :   null;
        }),
    };
});

vi.mock('@/pages/ProjectRequirements/RevisionComparisonDialog', () => ({
    RevisionComparisonDialog: ({
        visible,
        initialRevisionNumbers,
    }: Readonly<{ visible: boolean; initialRevisionNumbers?: readonly [number, number] }>) =>
        visible ? <div>Revision comparison {initialRevisionNumbers?.join(' → ') ?? 'default'}</div> : null,
}));

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
    description: `Description ${String(revisionNumber)}`,
    changeType: revisionNumber === 1 ? 'requirement_created' : 'content_changed',
    changeReason: revisionNumber === 1 ? 'Requirement created.' : `Revision ${String(revisionNumber)} reason.`,
    changedAt: `2026-09-2${String(revisionNumber - 1)}T08:00:00.000Z`,
    changedByUserId: null,
    changedByDisplayName: 'System',
}));

afterEach(() => {
    cleanup();
    actionBarStore.setState(() => ({ requirementKey: '' }));
    vi.clearAllMocks();
});

function renderPanel(onSelectRevision = vi.fn()) {
    render(
        <RevisionHistoryPanel
            projectId={baseRevision.projectId}
            requirementId={baseRevision.id}
            currentRevisionNumber={3}
            onSelectRevision={onSelectRevision}
        />,
    );
    return onSelectRevision;
}

describe('RevisionHistoryPanel', () => {
    it('shows newest revisions first and selects the current revision initially', () => {
        mocks.useQuery.mockReturnValue({ data: revisions, isLoading: false, isError: false });

        renderPanel();

        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('Revision 3')).toBeInTheDocument();
        expect(rows[1]).toHaveClass('revision-history-panel__row--selected');
        expect(within(rows[1]).queryByText('Current')).not.toBeInTheDocument();
        expect(within(rows[2]).getByText('Revision 2')).toBeInTheDocument();
        expect(within(rows[3]).getByText('Revision 1')).toBeInTheDocument();
        expect(within(rows[3]).getByText('Requirement created')).toBeInTheDocument();

        expect(mocks.useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [
                    '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/revisions',
                ],
            }),
        );
        expect(actionBarStore.state.revisionComparisonAvailable).toBe(true);
    });

    it('browses a revision on a normal row click', () => {
        mocks.useQuery.mockReturnValue({ data: revisions, isLoading: false, isError: false });
        const onSelectRevision = renderPanel();
        const revisionOneRow = screen.getByText('Revision 1').closest('tr');

        expect(revisionOneRow).not.toBeNull();
        fireEvent.click(revisionOneRow!);

        expect(revisionOneRow).toHaveClass('revision-history-panel__row--selected');
        expect(screen.getByText('Revision 3').closest('tr')).not.toHaveClass('revision-history-panel__row--selected');
        expect(onSelectRevision).toHaveBeenCalledWith(expect.objectContaining({ revisionNumber: 1 }));
    });

    it('marks two revisions with Ctrl+click and compares them from the selected-row context menu', () => {
        mocks.useQuery.mockReturnValue({ data: revisions, isLoading: false, isError: false });
        renderPanel();
        const revisionOneRow = screen.getByText('Revision 1').closest('tr');
        const revisionTwoRow = screen.getByText('Revision 2').closest('tr');

        expect(revisionOneRow).not.toBeNull();
        expect(revisionTwoRow).not.toBeNull();
        fireEvent.click(revisionOneRow!);
        fireEvent.click(revisionTwoRow!, { ctrlKey: true });

        expect(revisionOneRow).toHaveClass('revision-history-panel__row--selected');
        expect(revisionTwoRow).toHaveClass('revision-history-panel__row--selected');

        fireEvent.contextMenu(revisionOneRow!);
        fireEvent.click(screen.getByRole('button', { name: 'Compare revisions' }));

        expect(screen.getByText('Revision comparison 1 → 2')).toBeInTheDocument();
    });

    it('does not open the comparison context menu unless exactly two revisions are selected', () => {
        mocks.useQuery.mockReturnValue({ data: revisions, isLoading: false, isError: false });
        renderPanel();
        const revisionThreeRow = screen.getByText('Revision 3').closest('tr');

        expect(revisionThreeRow).not.toBeNull();
        fireEvent.contextMenu(revisionThreeRow!);

        expect(screen.queryByRole('button', { name: 'Compare revisions' })).not.toBeInTheDocument();
    });

    it('shows loading, error, and empty states', () => {
        mocks.useQuery.mockReturnValueOnce({ data: undefined, isLoading: true, isError: false });
        const { rerender } = render(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={3}
                onSelectRevision={vi.fn()}
            />,
        );
        expect(screen.getByText('Loading revision history …')).toBeInTheDocument();

        mocks.useQuery.mockReturnValueOnce({ data: undefined, isLoading: false, isError: true });
        rerender(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={3}
                onSelectRevision={vi.fn()}
            />,
        );
        expect(screen.getByText('Revision history could not be loaded.')).toBeInTheDocument();

        mocks.useQuery.mockReturnValueOnce({ data: [], isLoading: false, isError: false });
        rerender(
            <RevisionHistoryPanel
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                currentRevisionNumber={3}
                onSelectRevision={vi.fn()}
            />,
        );
        expect(screen.getByText('No revision history is available for this requirement.')).toBeInTheDocument();
    });
});
