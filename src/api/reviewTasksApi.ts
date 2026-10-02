import { z } from 'zod';

import { apiFetch } from '@/api/fetch';

const assigneeSchema = z.object({ userId: z.uuid(), username: z.string(), displayName: z.string() });

const reviewTaskSchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    requirementId: z.uuid(),
    requirementKey: z.string(),
    requirementDescription: z.string().nullable(),
    status: z.enum(['pending', 'completed']),
    assignee: assigneeSchema,
    assignedBy: assigneeSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
});

export type ReviewTaskAssignee = z.infer<typeof assigneeSchema>;
export type ReviewTask = z.infer<typeof reviewTaskSchema>;
export type ReviewTaskStatus = ReviewTask['status'];

type ApiResponse<T> = Readonly<{ data: T }>;

async function get<T>(url: string, schema: z.ZodType<T>): Promise<T> {
    const response = await apiFetch<ApiResponse<unknown>>(url);
    return schema.parse(response.data);
}

async function send<T>(url: string, method: 'POST' | 'PATCH', body: object, schema: z.ZodType<T>): Promise<T> {
    const response = await apiFetch<ApiResponse<unknown>>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return schema.parse(response.data);
}

export const getMyReviewTasksQueryKey = (projectId: string | undefined) => ['review-tasks', projectId, 'mine'] as const;
export const getRequirementReviewTasksQueryKey = (projectId: string | undefined, requirementId: string | undefined) =>
    ['review-tasks', projectId, 'requirement', requirementId] as const;
export const getReviewAssigneesQueryKey = (projectId: string | undefined) => ['review-assignees', projectId] as const;

export const listMyReviewTasks = (projectId: string): Promise<ReviewTask[]> =>
    get(`/projects/${projectId}/review-tasks`, z.array(reviewTaskSchema));

export const listRequirementReviewTasks = (projectId: string, requirementId: string): Promise<ReviewTask[]> =>
    get(`/projects/${projectId}/requirements/${requirementId}/review-tasks`, z.array(reviewTaskSchema));

export const listReviewAssignees = (projectId: string): Promise<ReviewTaskAssignee[]> =>
    get(`/projects/${projectId}/review-assignees`, z.array(assigneeSchema));

export const assignReviewTask = (
    projectId: string,
    requirementId: string,
    assigneeUserId: string,
): Promise<ReviewTask> =>
    send(
        `/projects/${projectId}/requirements/${requirementId}/review-tasks`,
        'POST',
        { assigneeUserId },
        reviewTaskSchema,
    );

export const updateReviewTaskStatus = (
    projectId: string,
    requirementId: string,
    taskId: string,
    status: ReviewTaskStatus,
): Promise<ReviewTask> =>
    send(
        `/projects/${projectId}/requirements/${requirementId}/review-tasks/${taskId}`,
        'PATCH',
        { status },
        reviewTaskSchema,
    );
