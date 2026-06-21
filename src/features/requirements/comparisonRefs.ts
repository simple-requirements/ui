export type ComparisonRef = { kind: 'current' } | { kind: 'revision'; revisionNumber: number };
export type ComparisonPair = Readonly<{ left: ComparisonRef; right: ComparisonRef }>;

export type ComparisonRefParseResult = { ok: true; value: ComparisonRef } | { ok: false; message: string };

export type ComparisonPairParseResult = { ok: true; value: ComparisonPair } | { ok: false; message: string };

const positiveIntegerPattern = /^[1-9]\d*$/;

export function formatComparisonRef(ref: ComparisonRef) {
    return ref.kind === 'current' ? 'current' : String(ref.revisionNumber);
}

export function parseComparisonRef(raw: string): ComparisonRefParseResult {
    if (raw !== raw.trim() || raw.length === 0) return { ok: false, message: 'Comparison refs cannot be blank.' };
    if (raw === 'current') return { ok: true, value: { kind: 'current' } };
    if (positiveIntegerPattern.test(raw)) return { ok: true, value: { kind: 'revision', revisionNumber: Number(raw) } };
    return { ok: false, message: 'Use current or a positive revision number.' };
}

export function parseComparisonPair(raw: string): ComparisonPairParseResult {
    const parts = raw.split('..');
    if (parts.length !== 2) return { ok: false, message: 'Use comparison syntax like 1..current.' };
    const left = parseComparisonRef(parts[0]);
    if (!left.ok) return left;
    const right = parseComparisonRef(parts[1]);
    if (!right.ok) return right;
    if (left.value.kind === 'current' && right.value.kind === 'current')
        return { ok: false, message: 'Choose at least one historical revision to compare with current.' };
    return { ok: true, value: { left: left.value, right: right.value } };
}

export function formatComparisonPair(pair: ComparisonPair) {
    return `${formatComparisonRef(pair.left)}..${formatComparisonRef(pair.right)}`;
}

export function buildRequirementComparisonPath(requirementId: string, pair: ComparisonPair) {
    return `/requirements/${encodeURIComponent(requirementId)}/compare/${formatComparisonPair(pair)}`;
}

export function parseRequirementComparisonPath(pathname: string) {
    const match = /^\/requirements\/([^/]+)\/compare\/([^/]+)$/.exec(pathname);
    if (!match) return null;
    const parsed = parseComparisonPair(decodeURIComponent(match[2]));
    return { requirementId: decodeURIComponent(match[1]), pair: parsed };
}
