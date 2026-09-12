import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Requirement } from '@/api/requirementsApi';
import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';

const rejectedRequirement: Requirement = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    categoryId: '33333333-3333-4333-8333-333333333333',
    sequenceNumber: 1,
    revisionNumber: 2,
    visibleKey: 'FR-AUTH-0001',
    status: 'rejected',
    description: 'Users can sign in.',
    priority: 'p1',
    owner: 'Alice',
    rationale: null,
    source: null,
    rejectionReason: 'The acceptance criterion is ambiguous.',
    reviewer: 'Bob Reviewer',
    rejectedAt: '2026-08-24T12:00:00.000Z',
    deletedAt: null,
    approvedAt: null,
    implementedAt: null,
    obsoletedBy: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    implementationTickets: [],
    createdAt: '2026-08-23T10:00:00.000Z',
    updatedAt: '2026-08-24T12:00:00.000Z',
};

describe('RequirementDetailsPanel', () => {
    it('shows reviewer, rejection reason, and rejection date for rejected requirements.', () => {
        render(
            <RequirementDetailsPanel
                requirement={rejectedRequirement}
                title='FR-AUTH-0001'
            />,
        );

        expect(screen.getByText('Bob Reviewer')).toBeInTheDocument();
        expect(screen.getByText('The acceptance criterion is ambiguous.')).toBeInTheDocument();
        expect(screen.getAllByText('Rejected')).toHaveLength(2);
        expect(screen.getAllByText(/2026/u).length).toBeGreaterThan(0);
    });

    it('shows the actor, reason, and timestamp for obsolete requirements while retaining the reviewer.', () => {
        render(
            <RequirementDetailsPanel
                requirement={{
                    ...rejectedRequirement,
                    status: 'obsolete',
                    reviewer: 'Rita Reviewer',
                    rejectionReason: null,
                    rejectedAt: null,
                    approvedAt: '2026-08-24T11:00:00.000Z',
                    obsoletedBy: 'Olivia Owner',
                    obsolescenceReason: 'Superseded by FR-AUTH-0002.',
                    obsoleteAt: '2026-08-25T12:00:00.000Z',
                }}
                title='FR-AUTH-0001'
            />,
        );

        expect(screen.getByText('Rita Reviewer')).toBeInTheDocument();
        expect(screen.getByText('Olivia Owner')).toBeInTheDocument();
        expect(screen.getByText('Superseded by FR-AUTH-0002.')).toBeInTheDocument();
        expect(screen.getAllByText('Obsolete')).toHaveLength(2);
    });
});
