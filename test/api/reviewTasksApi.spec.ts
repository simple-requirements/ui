import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    assignReviewTask,
    getMyReviewTasksQueryKey,
    listMyReviewTasks,
    listReviewAssignees,
    updateReviewTaskStatus,
} from '@/api/reviewTasksApi';
import type * as FetchModule from '@/api/fetch';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();
    return { ...actual, apiFetch: mocks.apiFetch };
});

const task = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    requirementId: '33333333-3333-4333-8333-333333333333',
    requirementKey: 'FR-AUTH-0001',
    requirementDescription: 'Review me.',
    status: 'pending',
    assignee: {
        userId: '44444444-4444-4444-8444-444444444444',
        username: 'reviewengineer',
        displayName: 'Review Engineer',
    },
    assignedBy: {
        userId: '55555555-5555-4555-8555-555555555555',
        username: 'requirementsengineer',
        displayName: 'Requirements Engineer',
    },
    createdAt: '2026-10-02T08:00:00.000Z',
    updatedAt: '2026-10-02T08:00:00.000Z',
    completedAt: null,
} as const;

afterEach(() => vi.clearAllMocks());

describe('reviewTasksApi', () => {
    it('uses a project-scoped personal task query key and parses tasks.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: [task], status: 200, headers: new Headers() });
        await expect(listMyReviewTasks(task.projectId)).resolves.toEqual([task]);
        expect(getMyReviewTasksQueryKey(task.projectId)).toEqual(['review-tasks', task.projectId, 'mine']);
    });

    it('lists eligible assignees.', async () => {
        mocks.apiFetch.mockResolvedValue({ data: [task.assignee], status: 200, headers: new Headers() });
        await expect(listReviewAssignees(task.projectId)).resolves.toEqual([task.assignee]);
    });

    it('assigns and completes review tasks with explicit JSON payloads.', async () => {
        mocks.apiFetch
            .mockResolvedValueOnce({ data: task, status: 201, headers: new Headers() })
            .mockResolvedValueOnce({ data: { ...task, status: 'completed' }, status: 200, headers: new Headers() });

        await assignReviewTask(task.projectId, task.requirementId, task.assignee.userId);
        await updateReviewTaskStatus(task.projectId, task.requirementId, task.id, 'completed');

        const [, assignRequest] = mocks.apiFetch.mock.calls[0] as [string, RequestInit];
        const [, updateRequest] = mocks.apiFetch.mock.calls[1] as [string, RequestInit];
        expect(assignRequest.body).toBe(JSON.stringify({ assigneeUserId: task.assignee.userId }));
        expect(updateRequest.body).toBe(JSON.stringify({ status: 'completed' }));
    });
});
