import { describe, expect, it } from 'vitest';
import {
    buildRequirementComparisonPath,
    formatComparisonPair,
    parseComparisonPair,
    parseComparisonRef,
    parseRequirementComparisonPath,
} from '@/features/requirements/comparisonRefs';
import {
    compareSources,
    makeCurrentSource,
    makeRevisionSource,
    mapComparisonError,
    visibleComparedFields,
} from '@/features/requirements/revisions';
import type { RequirementRevisionView } from '@/features/requirements/revisions';
import type { RequirementView } from '@/types/domain';

describe('comparison refs', () => {
    it('parses current and positive revision refs', () => {
        expect(parseComparisonRef('current')).toEqual({ ok: true, value: { kind: 'current' } });
        expect(parseComparisonRef('12')).toEqual({ ok: true, value: { kind: 'revision', revisionNumber: 12 } });
    });

    it('parses supported double-dot comparison pairs', () => {
        for (const raw of ['current..1', '1..current', '1..2']) {
            const parsed = parseComparisonPair(raw);
            expect(parsed.ok).toBe(true);
            if (parsed.ok) expect(formatComparisonPair(parsed.value)).toBe(raw);
        }
    });

    it('rejects invalid refs and pair syntax', () => {
        for (const raw of ['', 'Current', '0', '-1', '1.2', ' 1']) expect(parseComparisonRef(raw).ok).toBe(false);
        for (const raw of ['1', '1...2', '1..2..3', '..1', 'current..current'])
            expect(parseComparisonPair(raw).ok).toBe(false);
    });

    it('builds and parses fallback requirement comparison routes', () => {
        const pair = parseComparisonPair('1..current');
        expect(pair.ok).toBe(true);
        if (!pair.ok) return;
        const path = buildRequirementComparisonPath('req-1', pair.value);
        expect(path).toBe('/requirements/req-1/compare/1..current');
        expect(parseRequirementComparisonPath(path)?.pair.ok).toBe(true);
    });
});

describe('comparison model helpers', () => {
    const current: RequirementView = {
        id: 'req-1',
        projectId: 'project-1',
        visibleKey: 'FR-UX-0001',
        categoryId: 'cat-1',
        categoryKey: 'UX',
        categoryName: 'UX',
        type: 'FR',
        description: 'New description',
        priority: 'P1',
        status: 'draft',
        owner: 'Alice',
        rationale: null,
        source: '',
        renderedDescription: 'New description',
        metricReferences: [],
        rejectionReason: null,
        reviewer: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
    };
    const revision: RequirementRevisionView = {
        ...current,
        description: 'Old description',
        priority: 'P2',
        owner: null,
        source: 'Interview',
        requirementId: 'req-1',
        revisionNumber: 1,
        requirementCreatedAt: '2026-01-01T00:00:00Z',
        requirementUpdatedAt: '2026-01-02T00:00:00Z',
        readOnly: true,
    };

    it('separates text fields from metadata fields and preserves unchanged fields', () => {
        const model = compareSources(makeRevisionSource(revision), makeCurrentSource(current));
        expect(model.find((field) => field.field === 'description')).toMatchObject({
            kind: 'text',
            difference: 'changed',
        });
        expect(model.find((field) => field.field === 'priority')).toMatchObject({
            kind: 'metadata',
            difference: 'changed',
        });
        expect(model.find((field) => field.field === 'visibleKey')).toMatchObject({ difference: 'unchanged' });
    });

    it('collapses unchanged fields without hiding changed fields', () => {
        const model = compareSources(makeRevisionSource(revision), makeCurrentSource(current));
        expect(visibleComparedFields(model, false).every((field) => field.difference !== 'unchanged')).toBe(true);
        expect(visibleComparedFields(model, true).length).toBe(model.length);
    });

    it('maps comparison errors to user-safe messages', () => {
        expect(mapComparisonError(Object.assign(new Error('GET /requirements/req/revisions/9'), { status: 404 }))).toBe(
            'The requested revision was not found.',
        );
        expect(mapComparisonError(new Error('TypeError: stack trace'))).not.toContain('TypeError');
    });
});
