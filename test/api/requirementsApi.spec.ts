import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as FetchModule from '@/api/fetch';
import {
    compareRequirementRevisionsRequest,
    createImplementationTicketRequest,
    getListProjectRequirementsQueryKey,
    listProjectRequirementsRequest,
    listRequirementRevisionsRequest,
    markProjectRequirementObsoleteRequest,
    updateImplementationTicketRequest,
    implementationTicketSchema,
    requirementSchema,
    updateRequirementRequestSchema,
} from '@/api/requirementsApi';

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/api/fetch', async (importOriginal) => {
    const actual = await importOriginal<typeof FetchModule>();

    return { ...actual, apiFetch: mocks.apiFetch };
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('requirementsApi', () => {
    it('creates the list query key.', () => {
        expect(getListProjectRequirementsQueryKey('project-alpha')).toEqual(['/projects/project-alpha/requirements']);
    });

    it('parses a requirement.', () => {
        const requirement = requirementSchema.parse({
            id: '11111111-1111-4111-8111-111111111111',
            projectId: '22222222-2222-4222-8222-222222222222',
            categoryId: '33333333-3333-4333-8333-333333333333',
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
            reviewer: 'Bob',
            rejectedAt: null,
            approvedAt: '2026-06-29T11:00:00.000Z',
            implementedAt: null,
            obsoletedBy: null,
            obsolescenceReason: null,
            obsoleteAt: null,
            createdAt: '2026-06-28T10:00:00.000Z',
            updatedAt: '2026-06-29T11:30:00.000Z',
        });

        expect(requirement.visibleKey).toBe('FR-AUTH-0001');
        expect(requirement.status).toBe('approved');
        expect(requirement.changeReason).toBe('Requirement changed.');
        expect(requirement).not.toHaveProperty('deletedAt');
    });

    it('requires a non-empty change reason for requirement updates.', () => {
        const update = {
            description: 'Clarified requirement text.',
            priority: 'p1' as const,
            owner: 'Alice',
            rationale: 'Clarifies the intended authentication behavior.',
            source: 'Security review',
        };

        expect(
            updateRequirementRequestSchema.parse({
                ...update,
                changeReason: '  Clarified the authentication behavior.  ',
            }),
        ).toEqual({ ...update, changeReason: 'Clarified the authentication behavior.' });

        expect(updateRequirementRequestSchema.safeParse(update).success).toBe(false);
    });

    it('parses an implementation ticket with a derived URL.', () => {
        expect(
            implementationTicketSchema.parse({
                id: '44444444-4444-4444-8444-444444444444',
                requirementId: '11111111-1111-4111-8111-111111111111',
                ticketId: 'SOLAR-4711',
                completedBy: 'Ada Lovelace',
                completedAt: '2026-08-26',
                url: 'https://github.com/acme/issues/SOLAR-4711',
                createdAt: '2026-08-26T10:00:00.000Z',
                updatedAt: '2026-08-26T10:00:00.000Z',
            }).ticketId,
        ).toBe('SOLAR-4711');
    });

    it('lists and parses project requirements.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    projectId: '22222222-2222-4222-8222-222222222222',
                    categoryId: '33333333-3333-4333-8333-333333333333',
                    sequenceNumber: 1,
                    revisionNumber: 1,
                    changeType: 'content_changed',
                    changeReason: 'Requirement changed.',
                    changedAt: '2026-06-29T11:30:00.000Z',
                    changedByUserId: '66666666-6666-4666-8666-666666666666',
                    changedByDisplayName: 'Backend User',
                    visibleKey: 'NFR-PERF-0001',
                    status: 'draft',
                    description: null,
                    priority: null,
                    owner: null,
                    rationale: null,
                    source: null,
                    rejectionReason: null,
                    reviewer: null,
                    rejectedAt: null,
                    approvedAt: null,
                    implementedAt: null,
                    obsoletedBy: null,
                    obsolescenceReason: null,
                    obsoleteAt: null,
                    createdAt: '2026-06-28T10:00:00.000Z',
                    updatedAt: '2026-06-28T10:00:00.000Z',
                },
            ],
            status: 200,
            headers: new Headers(),
        });

        await expect(listProjectRequirementsRequest('project alpha')).resolves.toEqual([
            expect.objectContaining({
                id: '11111111-1111-4111-8111-111111111111',
                visibleKey: 'NFR-PERF-0001',
                status: 'draft',
            }),
        ]);

        expect(mocks.apiFetch).toHaveBeenCalledWith('/projects/project alpha/requirements', { method: 'GET' });
    });

    it('lists requirement revisions through the current backend route.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    projectId: '22222222-2222-4222-8222-222222222222',
                    categoryId: '33333333-3333-4333-8333-333333333333',
                    sequenceNumber: 1,
                    revisionNumber: 1,
                    changeType: 'requirement_created',
                    changeReason: 'Requirement created.',
                    changedAt: '2026-06-28T10:00:00.000Z',
                    changedByUserId: '66666666-6666-4666-8666-666666666666',
                    changedByDisplayName: 'Backend User',
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
                    createdAt: '2026-06-28T10:00:00.000Z',
                    updatedAt: '2026-06-28T10:00:00.000Z',
                },
            ],
        });

        await expect(
            listRequirementRevisionsRequest(
                '22222222-2222-4222-8222-222222222222',
                '11111111-1111-4111-8111-111111111111',
            ),
        ).resolves.toHaveLength(1);

        expect(mocks.apiFetch).toHaveBeenCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/revisions',
            { method: 'GET' },
        );
    });

    it('compares requirement revisions using the backend comparison contract.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: {
                projectId: '22222222-2222-4222-8222-222222222222',
                requirementId: '11111111-1111-4111-8111-111111111111',
                fromRevision: 1,
                toRevision: 2,
                differences: [{ field: 'description', from: 'Old', to: 'New' }],
            },
        });

        await expect(
            compareRequirementRevisionsRequest(
                '22222222-2222-4222-8222-222222222222',
                '11111111-1111-4111-8111-111111111111',
                1,
                2,
            ),
        ).resolves.toEqual(
            expect.objectContaining({
                fromRevision: 1,
                toRevision: 2,
                differences: [{ field: 'description', from: 'Old', to: 'New' }],
            }),
        );

        expect(mocks.apiFetch).toHaveBeenCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/revisions/compare?from=1&to=2',
            { method: 'GET' },
        );
    });

    it('creates and updates implementation tickets with user-entered completer names.', async () => {
        const ticketResponse = {
            id: '44444444-4444-4444-8444-444444444444',
            requirementId: '11111111-1111-4111-8111-111111111111',
            ticketId: 'AUTH-42',
            completedBy: 'Backend User',
            completedAt: '2026-09-09',
            url: null,
            createdAt: '2026-09-09T10:00:00.000Z',
            updatedAt: '2026-09-09T10:00:00.000Z',
        };
        mocks.apiFetch.mockResolvedValue({ data: ticketResponse });

        await createImplementationTicketRequest(
            '22222222-2222-4222-8222-222222222222',
            '11111111-1111-4111-8111-111111111111',
            { ticketId: 'AUTH-42', completedBy: 'Ada Developer', completedAt: '2026-09-09' },
        );

        expect(mocks.apiFetch).toHaveBeenLastCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/implementation-tickets',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ ticketId: 'AUTH-42', completedBy: 'Ada Developer', completedAt: '2026-09-09' }),
            }),
        );

        await updateImplementationTicketRequest(
            '22222222-2222-4222-8222-222222222222',
            '11111111-1111-4111-8111-111111111111',
            '44444444-4444-4444-8444-444444444444',
            { ticketId: 'AUTH-43', completedBy: 'Grace Developer', completedAt: '2026-09-10' },
        );

        expect(mocks.apiFetch).toHaveBeenLastCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111/implementation-tickets/44444444-4444-4444-8444-444444444444',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({
                    ticketId: 'AUTH-43',
                    completedBy: 'Grace Developer',
                    completedAt: '2026-09-10',
                }),
            }),
        );
    });

    it('marks a requirement obsolete with a reason.', async () => {
        mocks.apiFetch.mockResolvedValue({
            data: {
                id: '11111111-1111-4111-8111-111111111111',
                projectId: '22222222-2222-4222-8222-222222222222',
                categoryId: '33333333-3333-4333-8333-333333333333',
                sequenceNumber: 1,
                revisionNumber: 3,
                changeType: 'content_changed',
                changeReason: 'Requirement changed.',
                changedAt: '2026-06-29T11:30:00.000Z',
                changedByUserId: '66666666-6666-4666-8666-666666666666',
                changedByDisplayName: 'Backend User',
                visibleKey: 'FR-AUTH-0001',
                status: 'obsolete',
                description: 'Users can sign in.',
                priority: 'p1',
                owner: 'Alice',
                rationale: null,
                source: null,
                rejectionReason: null,
                reviewer: 'Bob',
                rejectedAt: null,
                approvedAt: '2026-06-29T11:00:00.000Z',
                implementedAt: null,
                obsoletedBy: 'Backend User',
                obsolescenceReason: 'Superseded by FR-AUTH-0002.',
                obsoleteAt: '2026-08-24T12:00:00.000Z',
                createdAt: '2026-06-28T10:00:00.000Z',
                updatedAt: '2026-08-24T12:00:00.000Z',
            },
            status: 200,
            headers: new Headers(),
        });

        await expect(
            markProjectRequirementObsoleteRequest(
                '22222222-2222-4222-8222-222222222222',
                '11111111-1111-4111-8111-111111111111',
                'Superseded by FR-AUTH-0002.',
            ),
        ).resolves.toEqual(expect.objectContaining({ status: 'obsolete' }));

        expect(mocks.apiFetch).toHaveBeenCalledWith(
            '/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ status: 'obsolete', obsolescenceReason: 'Superseded by FR-AUTH-0002.' }),
            }),
        );
    });
});
