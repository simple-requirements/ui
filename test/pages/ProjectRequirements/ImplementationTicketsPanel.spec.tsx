import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Requirement } from '@/api/requirementsApi';
import { ImplementationTicketsPanel } from '@/pages/ProjectRequirements/ImplementationTicketsPanel';
import { clearAuthenticatedSession, setAuthenticatedSession } from '@/stores/authStore';

const projectId = '11111111-1111-4111-8111-111111111111';

const approvedRequirement = {
    id: '22222222-2222-4222-8222-222222222222',
    projectId,
    categoryId: '33333333-3333-4333-8333-333333333333',
    sequenceNumber: 1,
    revisionNumber: 2,
    visibleKey: 'FR-AUTH-0001',
    status: 'approved',
    description: 'Users can sign in.',
    priority: 'p1',
    owner: 'Alice',
    rationale: null,
    source: null,
    rejectionReason: null,
    reviewer: 'Rita Reviewer',
    obsoletedBy: null,
    rejectedAt: null,
    deletedAt: null,
    approvedAt: '2026-09-01T10:00:00.000Z',
    implementedAt: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    implementationTickets: [
        {
            id: '44444444-4444-4444-8444-444444444444',
            requirementId: '22222222-2222-4222-8222-222222222222',
            ticketId: 'AUTH-42',
            completedBy: 'Dev Example',
            completedAt: '2026-09-02',
            url: null,
            createdAt: '2026-09-02T10:00:00.000Z',
            updatedAt: '2026-09-02T10:00:00.000Z',
        },
    ],
    createdAt: '2026-08-30T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
} satisfies Requirement;

function authenticate(role: 'requirements_engineer' | 'developer' | 'viewer') {
    setAuthenticatedSession({
        accessToken: 'test-token',
        user: {
            id: '55555555-5555-4555-8555-555555555555',
            username: role,
            email: `${role}@example.org`,
            displayName: role,
            status: 'active',
            globalRoles: [],
            projectMemberships: [{ projectId, roles: [role] }],
        },
    });
}

afterEach(() => {
    cleanup();
    clearAuthenticatedSession();
});

describe('ImplementationTicketsPanel permissions', () => {
    it('lets a Developer manage tickets on an approved requirement.', () => {
        authenticate('developer');
        render(<ImplementationTicketsPanel requirement={approvedRequirement} />);

        expect(screen.queryByRole('textbox', { name: 'Completed by' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add ticket' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit ticket' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete ticket' })).toBeInTheDocument();
    });

    it('keeps tickets visible but read-only for a Viewer.', () => {
        authenticate('viewer');
        render(<ImplementationTicketsPanel requirement={approvedRequirement} />);

        expect(screen.getByText(/AUTH-42/u)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add ticket' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Edit ticket' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete ticket' })).not.toBeInTheDocument();
    });

    it('keeps implemented requirement tickets read-only even for a Developer.', () => {
        authenticate('developer');
        render(<ImplementationTicketsPanel requirement={{ ...approvedRequirement, status: 'implemented' }} />);

        expect(screen.getByText(/AUTH-42/u)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add ticket' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Edit ticket' })).not.toBeInTheDocument();
    });
});
