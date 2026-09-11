import { z } from 'zod';

import { apiFetch } from '@/api/fetch';
import { requirementSchema, type Requirement } from '@/api/requirementsApi';

const replySchema = z.object({
    id: z.uuid(),
    commentId: z.uuid(),
    text: z.string(),
    author: z.string(),
    createdAt: z.iso.datetime(),
});

const commentSchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    requirementId: z.uuid(),
    createdForRevisionNumber: z.number().int().positive(),
    text: z.string(),
    status: z.enum(['open', 'closed']),
    author: z.string(),
    closedBy: z.string().nullable(),
    closeReason: z.enum(['resolved', 'requirement_rejected']).nullable(),
    closedInRevisionNumber: z.number().int().positive().nullable(),
    closedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    replies: z.array(replySchema),
});

const reviewSummarySchema = z.object({
    commentCount: z.number().int().nonnegative(),
    openCommentCount: z.number().int().nonnegative(),
    state: z.enum(['not_started', 'in_review', 'decision_pending']),
});

export type ReviewComment = z.infer<typeof commentSchema>;
export type ReviewCommentReply = z.infer<typeof replySchema>;
export type ReviewSummary = z.infer<typeof reviewSummarySchema>;

type ApiResponse<T> = Readonly<{ data: T }>;
const baseUrl = (projectId: string, requirementId: string): string =>
    `/projects/${projectId}/requirements/${requirementId}`;


export async function getReviewSummary(projectId: string, requirementId: string): Promise<ReviewSummary> {
    const response = await apiFetch<ApiResponse<unknown>>(`${baseUrl(projectId, requirementId)}/review-summary`);
    return reviewSummarySchema.parse(response.data);
}

export async function listReviewComments(projectId: string, requirementId: string): Promise<ReviewComment[]> {
    const response = await apiFetch<ApiResponse<unknown>>(`${baseUrl(projectId, requirementId)}/review-comments`);
    return z.array(commentSchema).parse(response.data);
}

async function send<T>(url: string, method: 'POST' | 'PATCH', body: object, schema: z.ZodType<T>): Promise<T> {
    const response = await apiFetch<ApiResponse<unknown>>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return schema.parse(response.data);
}

export const createReviewComment = (projectId: string, requirementId: string, text: string) =>
    send(`${baseUrl(projectId, requirementId)}/review-comments`, 'POST', { text }, commentSchema);

export const createReviewReply = (
    projectId: string,
    requirementId: string,
    commentId: string,
    text: string,
) =>
    send(
        `${baseUrl(projectId, requirementId)}/review-comments/${commentId}/replies`,
        'POST',
        { text },
        replySchema,
    );

export const resolveReviewComment = (projectId: string, requirementId: string, commentId: string) =>
    send(`${baseUrl(projectId, requirementId)}/review-comments/${commentId}`, 'PATCH', {}, commentSchema);

export const approveReview = (projectId: string, requirementId: string): Promise<Requirement> =>
    send(`${baseUrl(projectId, requirementId)}/review/approve`, 'POST', {}, requirementSchema);

export const rejectReview = (
    projectId: string,
    requirementId: string,
    rejectionReason: string,
): Promise<Requirement> =>
    send(
        `${baseUrl(projectId, requirementId)}/review/reject`,
        'POST',
        { rejectionReason },
        requirementSchema,
    );
