import { Button } from 'primereact/button';
import { useState } from 'react';

import type { ReviewComment } from '@/api/reviewApi';

const previewLength = 200;

function ExpandableText({
    id,
    text,
    expanded,
    onExpand,
}: Readonly<{ id: string; text: string; expanded: boolean; onExpand: (id: string) => void }>) {
    const truncated = text.length > previewLength && !expanded;
    return (
        <p>
            {truncated ? `${text.slice(0, previewLength)}…` : text}
            {truncated && (
                <button type='button' className='review-comment__read-more' onClick={() => onExpand(id)}>
                    weiter lesen
                </button>
            )}
        </p>
    );
}

type Props = Readonly<{
    comments: readonly ReviewComment[];
    pending: boolean;
    readOnly?: boolean;
    onComment: () => void;
    onReply: (comment: ReviewComment) => void;
    onResolve: (comment: ReviewComment) => void;
}>;

export function ReviewCommentsPanel({
    comments,
    pending,
    readOnly = false,
    onComment,
    onReply,
    onResolve,
}: Props) {
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());
    const expand = (id: string): void => setExpandedIds((current) => new Set(current).add(id));

    return (
        <section className='review-comments-panel' aria-labelledby='review-comments-title'>
            <header className='review-comments-panel__header'>
                <h2 id='review-comments-title'>Review comments</h2>
                {!readOnly && (
                    <Button
                        type='button'
                        label='Comment'
                        disabled={pending}
                        pt={{ root: { className: 'review-comments-panel__button review-comments-panel__button--comment' } }}
                        onClick={onComment}
                    />
                )}
            </header>
            <div className='review-comments-panel__list'>
                {comments.length === 0 && <p>No review comments yet.</p>}
                {comments.map((comment) => (
                    <article key={comment.id} className={`review-comment review-comment--${comment.status}`}>
                        <div className='review-comment__meta'>
                            <strong>{comment.author}</strong>
                            <time>{new Date(comment.createdAt).toLocaleString()}</time>
                        </div>
                        <ExpandableText
                            id={comment.id}
                            text={comment.text}
                            expanded={expandedIds.has(comment.id)}
                            onExpand={expand}
                        />
                        <p className='review-comment__status'>
                            {comment.status === 'open'
                                ? 'Open'
                                : comment.closeReason === 'requirement_rejected'
                                  ? 'Closed because requirement was rejected'
                                  : 'Resolved'}
                        </p>
                        {comment.replies.map((reply) => (
                            <div key={reply.id} className='review-comment__reply'>
                                <div className='review-comment__meta'>
                                    <strong>{reply.author}</strong>
                                    <time>{new Date(reply.createdAt).toLocaleString()}</time>
                                </div>
                                <ExpandableText
                                    id={reply.id}
                                    text={reply.text}
                                    expanded={expandedIds.has(reply.id)}
                                    onExpand={expand}
                                />
                            </div>
                        ))}
                        {comment.status === 'open' && !readOnly && (
                            <div className='review-comment__actions'>
                                <Button
                                    type='button'
                                    outlined
                                    label='Reply'
                                    disabled={pending}
                                    pt={{
                                        root: {
                                            className:
                                                'review-comments-panel__button review-comments-panel__button--reply',
                                        },
                                    }}
                                    onClick={() => onReply(comment)}
                                />
                                <Button
                                    type='button'
                                    label='Resolve'
                                    disabled={pending}
                                    pt={{
                                        root: {
                                            className:
                                                'review-comments-panel__button review-comments-panel__button--resolve',
                                        },
                                    }}
                                    onClick={() => onResolve(comment)}
                                />
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
