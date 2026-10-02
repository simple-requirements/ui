import { expect, it } from 'vitest';

import type { Category } from '@/api/categoriesApi';
import type { RequirementLinksOverview } from '@/api/requirementLinksApi';
import type { Requirement } from '@/api/requirementsApi';
import { emptyRequirementSearchFilters, filterRequirements } from '@/pages/ProjectRequirements/List/requirementSearch';

const categories: Category[] = [
    {
        id: '33333333-3333-4333-8333-333333333333',
        projectId: '22222222-2222-4222-8222-222222222222',
        name: 'Authentication',
        key: 'AUTH',
        type: 'FR',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
        id: '55555555-5555-4555-8555-555555555555',
        projectId: '22222222-2222-4222-8222-222222222222',
        name: 'Performance',
        key: 'PERF',
        type: 'NFR',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
];

function requirement(overrides: Partial<Requirement>): Requirement {
    return {
        id: '11111111-1111-4111-8111-111111111111',
        projectId: '22222222-2222-4222-8222-222222222222',
        categoryId: categories[0].id,
        sequenceNumber: 1,
        revisionNumber: 1,
        changeType: 'requirement_created',
        changeReason: 'Requirement created.',
        changedAt: '2026-01-01T00:00:00.000Z',
        changedByUserId: null,
        changedByDisplayName: 'System',
        visibleKey: 'FR-AUTH-0001',
        status: 'draft',
        description: 'Authenticate users.',
        priority: 'p1',
        owner: 'Alice',
        rationale: null,
        source: 'Security workshop',
        rejectionReason: null,
        reviewer: null,
        obsoletedBy: null,
        rejectedAt: null,
        approvedAt: null,
        implementedAt: null,
        obsolescenceReason: null,
        obsoleteAt: null,
        metricReferences: [
            {
                key: 'MET-0001',
                metricId: '99999999-9999-4999-8999-999999999999',
                value: '2000 ms',
                resolved: true,
                active: true,
            },
        ],
        implementationTickets: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

const first = requirement({});
const second = requirement({
    id: '44444444-4444-4444-8444-444444444444',
    categoryId: categories[1].id,
    visibleKey: 'NFR-PERF-0001',
    description: 'Dashboard latency.',
    status: 'obsolete',
    owner: 'Bob',
    priority: 'p2',
    metricReferences: [{ key: 'MET-9999', metricId: null, value: null, resolved: false, active: null }],
});
const links: RequirementLinksOverview = {
    outgoing: [
        {
            id: '77777777-7777-4777-8777-777777777777',
            projectId: first.projectId,
            relationshipType: 'references',
            source: {
                requirementId: first.id,
                visibleKey: first.visibleKey,
                type: 'FR',
                categoryId: first.categoryId,
                categoryName: 'Authentication',
                status: first.status,
            },
            target: {
                requirementId: second.id,
                visibleKey: second.visibleKey,
                type: 'NFR',
                categoryId: second.categoryId,
                categoryName: 'Performance',
                status: second.status,
            },
            createdAt: first.createdAt,
            updatedAt: first.updatedAt,
        },
    ],
    incoming: [],
};

it('combines search, category-derived type, metric, linked-requirement, and lifecycle filters', () => {
    expect(
        filterRequirements([first, second], categories, new Map([[first.id, links]]), {
            ...emptyRequirementSearchFilters,
            search: 'security',
            type: 'FR',
            metricKey: 'MET-0001',
            linkedRequirementKey: 'NFR-PERF-0001',
        }),
    ).toEqual([first]);
});

it('hides rejected/obsolete by default and can explicitly include/filter them', () => {
    expect(filterRequirements([first, second], categories, new Map(), emptyRequirementSearchFilters)).toEqual([first]);
    expect(
        filterRequirements([first, second], categories, new Map(), {
            ...emptyRequirementSearchFilters,
            includeInactive: true,
        }),
    ).toEqual([first, second]);
    expect(
        filterRequirements([first, second], categories, new Map(), {
            ...emptyRequirementSearchFilters,
            status: 'obsolete',
        }),
    ).toEqual([second]);
});

it('filters requirements with unresolved metric references', () => {
    expect(
        filterRequirements([first, second], categories, new Map(), {
            ...emptyRequirementSearchFilters,
            includeInactive: true,
            unresolvedMetricsOnly: true,
        }),
    ).toEqual([second]);
});
