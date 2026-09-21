import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import type { Requirement } from '@/api/requirementsApi';
import { RevisionComparisonDialog } from '@/pages/ProjectRequirements/RevisionComparisonDialog';

const mocks = vi.hoisted(() => ({ useQuery: vi.fn(), diffView: vi.fn() }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactQueryModule>();
    return { ...actual, useQuery: mocks.useQuery };
});

vi.mock('@git-diff-view/react', () => ({
    DiffModeEnum: { Split: 'split' },
    DiffView: (props: Readonly<{ data: unknown }>) => {
        mocks.diffView(props);
        return <div data-testid='description-diff' />;
    },
}));

vi.mock('primereact/dialog', () => ({
    Dialog: ({ visible, children }: Readonly<{ visible: boolean; children: ReactNode }>) =>
        visible ? <div role='dialog'>{children}</div> : null,
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
    description: revisionNumber === 3 ? 'Users can sign in securely.' : baseRevision.description,
    owner: revisionNumber === 3 ? 'Bob' : baseRevision.owner,
    changeType: revisionNumber === 1 ? 'requirement_created' : 'content_changed',
    changeReason: revisionNumber === 1 ? 'Requirement created.' : `Revision ${String(revisionNumber)}.`,
    changedAt: `2026-09-2${String(revisionNumber - 1)}T08:00:00.000Z`,
    changedByUserId: null,
    changedByDisplayName: 'System',
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('RevisionComparisonDialog', () => {
    it('compares the previous revision with the current revision and renders all non-description fields', () => {
        mocks.useQuery.mockReturnValue({
            data: {
                fromRevision: 2,
                toRevision: 3,
                differences: [
                    { field: 'description', from: 'Users can sign in.', to: 'Users can sign in securely.' },
                    { field: 'owner', from: 'Alice', to: 'Bob' },
                ],
            },
            isLoading: false,
            isError: false,
        });

        render(
            <RevisionComparisonDialog
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={revisions}
                visible
                onHide={vi.fn()}
            />,
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('From revision')).toHaveValue('2');
        expect(screen.getByLabelText('To revision')).toHaveValue('3');
        expect(screen.getByTestId('description-diff')).toBeInTheDocument();
        expect(screen.getByRole('rowheader', { name: 'Owner' })).toBeInTheDocument();
        expect(screen.getByRole('rowheader', { name: 'Priority' })).toBeInTheDocument();
        expect(screen.getByRole('rowheader', { name: 'Owner' }).closest('tr')).toHaveClass(
            'revision-comparison-dialog__field--changed',
        );
        expect(screen.getByRole('rowheader', { name: 'Priority' }).closest('tr')).not.toHaveClass(
            'revision-comparison-dialog__field--changed',
        );
        expect(mocks.diffView).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    oldFile: expect.objectContaining({ content: 'Users can sign in.' }),
                    newFile: expect.objectContaining({ content: 'Users can sign in securely.' }),
                }),
            }),
        );
    });

    it('loads a new comparison when a revision selector changes', () => {
        mocks.useQuery.mockReturnValue({
            data: { fromRevision: 2, toRevision: 3, differences: [] },
            isLoading: false,
            isError: false,
        });

        render(
            <RevisionComparisonDialog
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={revisions}
                visible
                onHide={vi.fn()}
            />,
        );

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

    it('does not render when comparison is unavailable', () => {
        mocks.useQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });

        render(
            <RevisionComparisonDialog
                projectId={baseRevision.projectId}
                requirementId={baseRevision.id}
                revisions={[revisions[0]]}
                visible
                onHide={vi.fn()}
            />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
