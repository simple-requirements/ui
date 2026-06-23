import { describe, expect, it } from 'vitest';
import {
    mapRequirementLink,
    mapRequirementLinkChanges,
    normalizeRequirementLinkTargetKey,
    sortRequirementLinks,
} from '@/features/requirements/api/requirementLinksApi';
import {
    compareLinkCollections,
    describeLink,
    visibleComparedLinkGroups,
} from '@/features/requirements/requirementLinks';
import type { RequirementLinkChangesResponseDto, RequirementLinkResponseDto } from '@/api/generated/models';
import type { RequirementLinkView } from '@/types/domain';

const dto = (overrides: Partial<RequirementLinkResponseDto> = {}): RequirementLinkResponseDto => ({
    id: overrides.id ?? 'link-1',
    projectId: overrides.projectId ?? 'project-1',
    relationshipType: overrides.relationshipType ?? 'references',
    sourceRequirementId: overrides.sourceRequirementId ?? 'source-1',
    sourceVisibleKey: overrides.sourceVisibleKey ?? 'FR-UI-0001',
    sourceType: overrides.sourceType ?? 'FR',
    sourceCategoryId: overrides.sourceCategoryId ?? 'cat-ui',
    sourceCategoryKey: overrides.sourceCategoryKey,
    sourceStatus: overrides.sourceStatus ?? 'draft',
    targetRequirementId: overrides.targetRequirementId ?? 'target-1',
    targetVisibleKey: overrides.targetVisibleKey ?? 'NFR-PERF-0001',
    targetType: overrides.targetType ?? 'NFR',
    targetCategoryId: overrides.targetCategoryId ?? 'cat-perf',
    targetCategoryKey: overrides.targetCategoryKey,
    targetStatus: overrides.targetStatus ?? 'approved',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
});

const view = (overrides: Partial<RequirementLinkResponseDto> = {}): RequirementLinkView =>
    mapRequirementLink(dto(overrides));

describe('requirement link API mapping', () => {
    it('maps missing category keys to display placeholders', () => {
        expect(mapRequirementLink(dto())).toMatchObject({
            sourceCategoryKey: '—',
            targetCategoryKey: '—',
            sourceVisibleKey: 'FR-UI-0001',
            targetVisibleKey: 'NFR-PERF-0001',
        });
    });

    it('normalizes link target visible keys before mutations', () => {
        expect(normalizeRequirementLinkTargetKey(' nfr-perf-0001 ')).toBe('NFR-PERF-0001');
    });

    it('sorts links deterministically by visible keys and id', () => {
        const sorted = sortRequirementLinks([
            view({ id: 'b', sourceVisibleKey: 'FR-UI-0002', targetVisibleKey: 'NFR-PERF-0002' }),
            view({ id: 'a', sourceVisibleKey: 'FR-UI-0001', targetVisibleKey: 'NFR-PERF-0001' }),
        ]);

        expect(sorted.map((link) => link.id)).toEqual(['a', 'b']);
    });

    it('maps link-change response groups', () => {
        const response: RequirementLinkChangesResponseDto = {
            requirementId: 'source-1',
            fromRevision: 1,
            toRevision: 2,
            addedOutgoingLinks: [dto({ id: 'added' })],
            removedOutgoingLinks: [dto({ id: 'removed' })],
            unchangedOutgoingLinks: [],
            addedIncomingLinks: [],
            removedIncomingLinks: [],
            unchangedIncomingLinks: [dto({ id: 'unchanged-incoming' })],
        };

        const mapped = mapRequirementLinkChanges(response);

        expect(mapped.addedOutgoingLinks.map((link) => link.id)).toEqual(['added']);
        expect(mapped.removedOutgoingLinks.map((link) => link.id)).toEqual(['removed']);
        expect(mapped.unchangedIncomingLinks.map((link) => link.id)).toEqual(['unchanged-incoming']);
    });
});

describe('requirement link comparison helpers', () => {
    it('classifies added, removed, and unchanged outgoing links', () => {
        const unchanged = view({ id: 'unchanged', targetRequirementId: 'target-same' });
        const removed = view({ id: 'removed', targetRequirementId: 'target-old', targetVisibleKey: 'FR-OLD-0001' });
        const added = view({ id: 'added', targetRequirementId: 'target-new', targetVisibleKey: 'FR-NEW-0001' });
        const groups = compareLinkCollections(
            { outgoingLinks: [unchanged, removed], incomingLinks: [] },
            { outgoingLinks: [unchanged, added], incomingLinks: [] },
        );

        expect(groups.find((group) => group.direction === 'outgoing' && group.difference === 'added')?.links).toEqual([
            added,
        ]);
        expect(groups.find((group) => group.direction === 'outgoing' && group.difference === 'removed')?.links).toEqual(
            [removed],
        );
        expect(
            groups.find((group) => group.direction === 'outgoing' && group.difference === 'unchanged')?.links,
        ).toEqual([unchanged]);
    });

    it('hides unchanged link groups when requested', () => {
        const groups = compareLinkCollections(
            { outgoingLinks: [], incomingLinks: [] },
            { outgoingLinks: [], incomingLinks: [] },
        );

        expect(visibleComparedLinkGroups(groups, false).every((group) => group.difference !== 'unchanged')).toBe(true);
    });

    it('describes incoming and outgoing links from the selected requirement perspective', () => {
        const link = view();

        expect(describeLink(link, 'outgoing')).toBe('FR-UI-0001 references NFR-PERF-0001');
        expect(describeLink(link, 'incoming')).toBe('NFR-PERF-0001 is referenced by FR-UI-0001');
    });
});
