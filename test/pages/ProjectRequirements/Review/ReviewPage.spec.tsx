import '@testing-library/jest-dom/vitest';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewPage } from '@/pages/ProjectRequirements/Review/ReviewPage';
import { actionBarStore, requestReviewDecision } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({
    useProjectPermissions: vi.fn(),
    useReviewQueries: vi.fn(),
    runReviewAction: vi.fn(),
    approveReview: vi.fn(),
    rejectReview: vi.fn(),
    createReviewComment: vi.fn(),
    createReviewReply: vi.fn(),
    resolveReviewComment: vi.fn(),
    invalidateQueries: vi.fn(),
}));

vi.mock('@/auth/projectPermissions', () => ({ useProjectPermissions: mocks.useProjectPermissions }));
vi.mock('@/pages/ProjectRequirements/Review/useReviewQueries', () => ({ useReviewQueries: mocks.useReviewQueries }));
vi.mock('@/pages/ProjectRequirements/Review/useReviewMutationRunner', () => ({
    useReviewMutationRunner: () => ({ pending: false, runReviewAction: mocks.runReviewAction }),
}));
vi.mock('@/api/reviewApi', () => ({
    approveReview: mocks.approveReview,
    rejectReview: mocks.rejectReview,
    createReviewComment: mocks.createReviewComment,
    createReviewReply: mocks.createReviewReply,
    resolveReviewComment: mocks.resolveReviewComment,
}));
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/pages/ProjectRequirements/Review/ReviewWorkspace', () => ({
    ReviewWorkspace: ({ readOnly, onComment }: Readonly<{ readOnly: boolean; onComment: () => void }>) => (
        <div>
            <output aria-label='Review mode'>{readOnly ? 'read only' : 'editable'}</output>
            <button
                type='button'
                onClick={onComment}>
                Comment
            </button>
        </div>
    ),
}));
vi.mock('@/pages/ProjectRequirements/Review/ReviewDialogs', () => ({
    ReviewDialogs: ({
        composer,
        decisionRequest,
        visible,
        onSubmitComposer,
        onConfirmDecision,
    }: Readonly<{
        composer: unknown;
        decisionRequest: string | undefined;
        visible: boolean;
        onSubmitComposer: (text: string) => Promise<void>;
        onConfirmDecision: (reason?: string) => Promise<void>;
    }>) => (
        <div>
            <output aria-label='Dialogs visible'>{String(visible)}</output>
            {composer !== undefined && (
                <button
                    type='button'
                    onClick={() => void onSubmitComposer('Looks good')}>
                    Submit comment
                </button>
            )}
            {decisionRequest !== undefined && (
                <button
                    type='button'
                    onClick={() => void onConfirmDecision('No')}>
                    Confirm decision
                </button>
            )}
        </div>
    ),
}));

const requirement = { id: 'requirement-1', visibleKey: 'FR-AUTH-0001', status: 'draft', implementationTickets: [] };

function LocationProbe() {
    return <output aria-label='Location'>{useLocation().pathname}</output>;
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/projects/project-1/requirements/requirement-1/review']}>
            <LocationProbe />
            <Routes>
                <Route
                    path='/projects/:projectId/requirements/:requirementId/review'
                    element={<ReviewPage />}
                />
                <Route
                    path='/projects/:projectId/requirements/:requirementId'
                    element={<h1>Requirement details</h1>}
                />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mocks.useProjectPermissions.mockReturnValue({ canManageRequirements: true });
    mocks.useReviewQueries.mockReturnValue({
        requirement,
        comments: [],
        summary: { state: 'in_review' },
        loading: false,
        error: false,
    });
    mocks.runReviewAction.mockImplementation(async (action: () => Promise<unknown>) => {
        await action();
        return true;
    });
    mocks.createReviewComment.mockResolvedValue({ id: 'comment-1' });
    mocks.createReviewReply.mockResolvedValue({ id: 'reply-1' });
    mocks.resolveReviewComment.mockResolvedValue({ id: 'comment-1' });
    mocks.invalidateQueries.mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
    actionBarStore.setState(() => ({ requirementKey: '' }));
    vi.clearAllMocks();
});

describe('ReviewPage', () => {
    it('renders editable review controls for a requirements engineer and submits a comment', async () => {
        const user = userEvent.setup();
        renderPage();

        expect(screen.getByLabelText('Review mode')).toHaveTextContent('editable');
        await user.click(screen.getByRole('button', { name: 'Comment' }));
        await user.click(screen.getByRole('button', { name: 'Submit comment' }));

        expect(mocks.runReviewAction).toHaveBeenCalledOnce();
    });

    it('redirects a non-draft requirement back to its details route', async () => {
        mocks.useReviewQueries.mockReturnValue({
            requirement: { ...requirement, status: 'approved' },
            comments: [],
            summary: { state: 'in_review' },
            loading: false,
            error: false,
        });
        renderPage();

        expect(await screen.findByRole('heading', { name: 'Requirement details' })).toBeInTheDocument();
    });

    it('confirms an approval request and navigates to details after invalidating requirements', async () => {
        const user = userEvent.setup();
        mocks.approveReview.mockResolvedValue({ ...requirement, status: 'approved' });
        renderPage();
        act(() => requestReviewDecision('approve'));

        await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm decision' })).toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: 'Confirm decision' }));

        await waitFor(() =>
            expect(screen.getByLabelText('Location')).toHaveTextContent(
                '/projects/project-1/requirements/requirement-1',
            ),
        );
        expect(mocks.approveReview).toHaveBeenCalledWith('project-1', 'requirement-1');
        expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);
    });
});
