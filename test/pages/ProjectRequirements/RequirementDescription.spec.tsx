import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { Requirement } from '@/api/requirementsApi';
import { RequirementDescription } from '@/pages/ProjectRequirements/RequirementDescription';

const baseRequirement: Requirement = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    categoryId: '33333333-3333-4333-8333-333333333333',
    sequenceNumber: 1,
    revisionNumber: 1,
    changeType: 'requirement_created',
    changeReason: 'Requirement created.',
    changedAt: '2026-09-30T10:00:00.000Z',
    changedByUserId: null,
    changedByDisplayName: 'Requirements Engineer',
    visibleKey: 'NFR-PERF-0001',
    status: 'draft',
    description: 'Response time below [~MET-0001], fallback [~MET-9999], repeated [~MET-0001].',
    metricReferences: [
        {
            key: 'MET-0001',
            metricId: '44444444-4444-4444-8444-444444444444',
            value: '2000 ms',
            resolved: true,
            active: true,
        },
        { key: 'MET-9999', metricId: null, value: null, resolved: false, active: null },
    ],
    priority: null,
    owner: null,
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
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
};

describe('RequirementDescription', () => {
    it('renders current metric values as links and unresolved placeholders as errors.', () => {
        render(
            <MemoryRouter>
                <RequirementDescription requirement={baseRequirement} />
            </MemoryRouter>,
        );

        const metricLinks = screen.getAllByRole('link', { name: 'MET-0001: 2000 ms. Open metric details.' });
        expect(metricLinks).toHaveLength(2);
        expect(metricLinks[0]).toHaveAttribute(
            'href',
            '/projects/22222222-2222-4222-8222-222222222222/metrics/44444444-4444-4444-8444-444444444444',
        );
        expect(screen.getByText('[~MET-9999]')).toHaveClass('requirement-metric-reference--unresolved');
        expect(screen.queryByText('[~MET-0001]')).not.toBeInTheDocument();
    });

    it('uses frozen rendered text for historical revisions without live metric links.', () => {
        render(
            <MemoryRouter>
                <RequirementDescription
                    requirement={{
                        ...baseRequirement,
                        metricReferences: undefined,
                        renderedDescription: 'Response time below 2500 ms.',
                    }}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('Response time below 2500 ms.')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
