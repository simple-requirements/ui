import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as FetchModule from '@/api/fetch';
import {
    approveReview,
    createReviewComment,
    createReviewReply,
    rejectReview,
    resolveReviewComment,
} from '@/api/reviewApi';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();

    return { ...actual, apiFetch: mocks.apiFetch };
});

afterEach(() => {
    vi.clearAllMocks();
});

const commentResponse = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    requirementId: '33333333-3333-4333-8333-333333333333',
    createdForRevisionNumber: 1,
    text: 'Needs clarification.',
    status: 'open',
    author: 'Authenticated Reviewer',
    closedBy: null,
    closeReason: null,
    closedInRevisionNumber: null,
    closedAt: null,
    createdAt: '2026-09-09T10:00:00.000Z',
    updatedAt: '2026-09-09T10:00:00.000Z',
    replies: [],
};

const replyResponse = {
    id: '44444444-4444-4444-8444-444444444444',
    commentId: commentResponse.id,
    text: 'Clarified.',
    author: 'Authenticated Reviewer',
    createdAt: '2026-09-09T10:05:00.000Z',
};

const requirementResponse = {
    id: '33333333-3333-4333-8333-333333333333',
    projectId: '22222222-2222-4222-8222-222222222222',
    categoryId: '55555555-5555-4555-8555-555555555555',
    sequenceNumber: 1,
    revisionNumber: 2,
    changeType: 'content_changed',
    changeReason: 'Requirement changed.',
    changedAt: '2026-06-29T11:30:00.000Z',
    changedByUserId: '66666666-6666-4666-8666-666666666666',
    changedByDisplayName: 'Backend User',
    visibleKey: 'FR-AUTH-0001',
    status: 'approved',
    description: 'Users can sign in.',
    priority: 'p1',
    owner: 'Alice',
    rationale: null,
    source: null,
    rejectionReason: null,
    reviewer: 'Authenticated Reviewer',
    rejectedAt: null,
    approvedAt: '2026-09-09T10:10:00.000Z',
    implementedAt: null,
    obsoletedBy: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    implementationTickets: [],
    createdAt: '2026-09-09T09:00:00.000Z',
    updatedAt: '2026-09-09T10:10:00.000Z',
};

describe('reviewApi', () => {
    it('creates comments without client-supplied actor names.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: commentResponse });

        await expect(
            createReviewComment(
                '22222222-2222-4222-8222-222222222222',
                '33333333-3333-4333-8333-333333333333',
                'Needs clarification.',
            ),
        ).resolves.toEqual(expect.objectContaining({ author: 'Authenticated Reviewer' }));

        expect(mocks.apiFetch).toHaveBeenCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/33333333-3333-4333-8333-333333333333/review-comments',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ text: 'Needs clarification.' }) }),
        );
    });

    it('creates replies without client-supplied actor names.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: replyResponse });

        await expect(
            createReviewReply(
                '22222222-2222-4222-8222-222222222222',
                '33333333-3333-4333-8333-333333333333',
                '11111111-1111-4111-8111-111111111111',
                'Clarified.',
            ),
        ).resolves.toEqual(expect.objectContaining({ author: 'Authenticated Reviewer' }));

        expect(mocks.apiFetch).toHaveBeenCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/33333333-3333-4333-8333-333333333333/review-comments/11111111-1111-4111-8111-111111111111/replies',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ text: 'Clarified.' }) }),
        );
    });

    it('resolves comments without client-supplied resolver names.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: {
                ...commentResponse,
                status: 'closed',
                closedBy: 'Authenticated Reviewer',
                closeReason: 'resolved',
                closedAt: '2026-09-09T10:15:00.000Z',
            },
        });

        await resolveReviewComment(
            '22222222-2222-4222-8222-222222222222',
            '33333333-3333-4333-8333-333333333333',
            '11111111-1111-4111-8111-111111111111',
        );

        expect(mocks.apiFetch).toHaveBeenCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/33333333-3333-4333-8333-333333333333/review-comments/11111111-1111-4111-8111-111111111111',
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({}) }),
        );
    });

    it('approves and rejects without client-supplied reviewer names.', async () => {
        mocks.apiFetch.mockResolvedValueOnce({ data: requirementResponse });
        await approveReview('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333');
        expect(mocks.apiFetch).toHaveBeenLastCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/33333333-3333-4333-8333-333333333333/review/approve',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({}) }),
        );

        mocks.apiFetch.mockResolvedValueOnce({
            data: { ...requirementResponse, status: 'rejected', rejectionReason: 'Ambiguous.' },
        });
        await rejectReview(
            '22222222-2222-4222-8222-222222222222',
            '33333333-3333-4333-8333-333333333333',
            'Ambiguous.',
        );
        expect(mocks.apiFetch).toHaveBeenLastCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/33333333-3333-4333-8333-333333333333/review/reject',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ rejectionReason: 'Ambiguous.' }) }),
        );
    });
});
