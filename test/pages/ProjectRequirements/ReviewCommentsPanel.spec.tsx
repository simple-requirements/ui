import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ReviewComment } from '@/api/reviewApi';
import { ReviewCommentsPanel } from '@/pages/ProjectRequirements/Review/ReviewCommentsPanel';

const longText = 'A'.repeat(220);
const comment: ReviewComment = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    requirementId: '33333333-3333-4333-8333-333333333333',
    createdForRevisionNumber: 1,
    text: longText,
    status: 'open',
    author: 'Jane Reviewer',
    closedBy: null,
    closeReason: null,
    closedInRevisionNumber: null,
    closedAt: null,
    createdAt: '2026-08-23T10:00:00.000Z',
    updatedAt: '2026-08-23T10:00:00.000Z',
    replies: [],
};

describe('ReviewCommentsPanel', () => {
    it('expands comments longer than 200 characters and exposes review actions for open comments.', async () => {
        const user = userEvent.setup();
        const onReply = vi.fn();
        const onResolve = vi.fn();
        render(
            <ReviewCommentsPanel
                comments={[comment]}
                pending={false}
                onComment={vi.fn()}
                onReply={onReply}
                onResolve={onResolve}
            />,
        );

        expect(screen.queryByText(longText)).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'weiter lesen' }));
        expect(screen.getByText(longText)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Reply' }));
        await user.click(screen.getByRole('button', { name: 'Resolve' }));
        expect(onReply).toHaveBeenCalledWith(comment);
        expect(onResolve).toHaveBeenCalledWith(comment);
    });
    it('renders existing comments without mutation controls in read-only mode.', () => {
        render(
            <ReviewCommentsPanel
                comments={[comment]}
                pending={false}
                readOnly
                onComment={vi.fn()}
                onReply={vi.fn()}
                onResolve={vi.fn()}
            />,
        );

        expect(screen.getByText('Jane Reviewer')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Comment' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Reply' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Resolve' })).not.toBeInTheDocument();
    });
});
