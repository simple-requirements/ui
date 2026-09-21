import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as RequirementsApiModule from '@/api/requirementsApi';
import type { Requirement } from '@/api/requirementsApi';
import { useImplementationTicketEditor } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/useImplementationTicketEditor';

const mocks = vi.hoisted(() => ({
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    invalidateQueries: vi.fn(),
    showToastMessage: vi.fn(),
}));

vi.mock('@/api/requirementsApi', async (importOriginal) => {
    const actual = await importOriginal<typeof RequirementsApiModule>();
    return {
        ...actual,
        createImplementationTicketRequest: mocks.create,
        updateImplementationTicketRequest: mocks.update,
        deleteImplementationTicketRequest: mocks.remove,
    };
});
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/components/Feedback/toastEvents', () => ({ showToastMessage: mocks.showToastMessage }));

const requirement = {
    id: '22222222-2222-4222-8222-222222222222',
    projectId: '11111111-1111-4111-8111-111111111111',
    categoryId: '33333333-3333-4333-8333-333333333333',
    sequenceNumber: 1,
    revisionNumber: 1,
    changeType: 'created',
    changeReason: 'Created',
    changedAt: '2026-09-01T10:00:00.000Z',
    changedByUserId: null,
    changedByDisplayName: 'Alice',
    visibleKey: 'FR-AUTH-0001',
    status: 'approved',
    description: 'Sign in',
    priority: 'p1',
    owner: null,
    rationale: null,
    source: null,
    rejectionReason: null,
    reviewer: null,
    obsoletedBy: null,
    rejectedAt: null,
    approvedAt: '2026-09-01T10:00:00.000Z',
    implementedAt: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    implementationTickets: [],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
} satisfies Requirement;

afterEach(() => vi.clearAllMocks());

describe('useImplementationTicketEditor', () => {
    it('creates a valid ticket, refreshes requirements, and resets the form', async () => {
        mocks.create.mockResolvedValue(undefined);
        mocks.invalidateQueries.mockResolvedValue(undefined);
        const { result } = renderHook(() => useImplementationTicketEditor({ requirement, editable: true }));

        act(() => {
            result.current.updateFormField('ticketId', 'AUTH-42');
            result.current.updateFormField('completedBy', 'Dev Example');
            result.current.updateFormField('completedAt', '2026-09-20');
        });

        await act(async () => result.current.submit());

        expect(mocks.create).toHaveBeenCalledOnce();
        expect(mocks.invalidateQueries).toHaveBeenCalledOnce();
        expect(result.current.form.ticketId).toBe('');
        expect(result.current.pending).toBe(false);
        expect(mocks.showToastMessage).toHaveBeenCalledOnce();
    });

    it('edits and deletes an existing ticket when editable', async () => {
        const ticket = {
            id: 'ticket-1',
            requirementId: requirement.id,
            ticketId: 'AUTH-42',
            completedBy: 'Dev',
            completedAt: '2026-09-20',
            url: null,
            createdAt: '2026-09-20T10:00:00.000Z',
            updatedAt: '2026-09-20T10:00:00.000Z',
        };
        mocks.update.mockResolvedValue(undefined);
        mocks.remove.mockResolvedValue(undefined);
        mocks.invalidateQueries.mockResolvedValue(undefined);
        const { result } = renderHook(() => useImplementationTicketEditor({ requirement, editable: true }));

        act(() => result.current.edit(ticket));
        await act(async () => result.current.submit());
        await act(async () => result.current.remove(ticket.id));

        expect(mocks.update).toHaveBeenCalledWith(requirement.projectId, requirement.id, ticket.id, expect.any(Object));
        expect(mocks.remove).toHaveBeenCalledWith(requirement.projectId, requirement.id, ticket.id);
    });

    it('ignores submit and delete operations in read-only mode', async () => {
        const { result } = renderHook(() => useImplementationTicketEditor({ requirement, editable: false }));

        await act(async () => result.current.submit());
        await act(async () => result.current.remove('ticket-1'));

        expect(mocks.create).not.toHaveBeenCalled();
        expect(mocks.remove).not.toHaveBeenCalled();
    });
});
