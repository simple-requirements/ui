import { getMetricByKey, createMetric, metricKeyPattern, normalizeMetricKey } from '@/features/metrics/api/metricsApi';
import type { MetricReferenceView, MetricView } from '@/types/domain';

export interface InlineMetricDefinition {
    key: string;
    value: string;
    description: string | null;
}

export interface MetricAuthoringParseResult {
    normalizedText: string;
    definitions: readonly InlineMetricDefinition[];
    invalidTokens: readonly string[];
    parseErrors: readonly string[];
}

const metricTokenPattern = /\[\s*~([^\]]*)\]/g;

const normalizeNullableDescription = (value: string | null | undefined) => {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : null;
};

const sameDefinition = (left: InlineMetricDefinition, right: InlineMetricDefinition) =>
    left.key === right.key && left.value === right.value && left.description === right.description;

const assertMetricMatchesDefinition = (metric: MetricView, definition: InlineMetricDefinition) => {
    const metricDescription = normalizeNullableDescription(metric.description);
    if (metric.value === definition.value && metricDescription === definition.description) return;
    throw new Error(
        `Metric ${definition.key} already exists with a different value or description. Use [~${definition.key}] to reference the existing metric or change the metric explicitly first.`,
    );
};

/** Parses frontend-only inline metric authoring syntax and returns backend-safe normalized requirement text. */
export function parseMetricAuthoringText(text: string): MetricAuthoringParseResult {
    const definitions: InlineMetricDefinition[] = [];
    const invalidTokens: string[] = [];
    const parseErrors: string[] = [];
    const definitionsByKey = new Map<string, InlineMetricDefinition>();

    const normalizedText = text.replace(metricTokenPattern, (token, raw: string) => {
        const content = raw.trim();
        if (!content) return invalid(token, 'Metric token is empty.');

        if (!content.includes(':=') && !content.includes('|')) {
            const key = normalizeMetricKey(content);
            if (!metricKeyPattern.test(key)) return invalid(token, 'Metric key must match MET-0001.');
            return `[~${key}]`;
        }

        if (!content.includes(':=')) return invalid(token, 'Metric definitions must use := between key and value.');

        const [rawKey, rawDefinition] = content.split(':=', 2);
        const key = normalizeMetricKey(rawKey);
        if (!metricKeyPattern.test(key)) return invalid(token, 'Metric key must match MET-0001.');

        const [rawValue, rawDescription, ...extraParts] = rawDefinition.split('|');
        if (extraParts.length > 0) return invalid(token, 'Metric definitions may contain only one description separator.');

        const value = rawValue.trim();
        if (!value) return invalid(token, 'Metric value is required.');

        const hasDescriptionSeparator = rawDefinition.includes('|');
        const description = hasDescriptionSeparator ? normalizeNullableDescription(rawDescription) : null;
        if (hasDescriptionSeparator && !description) return invalid(token, 'Metric description is required after |.');

        const definition = { key, value, description };
        const existing = definitionsByKey.get(key);
        if (existing && !sameDefinition(existing, definition)) {
            return invalid(token, `Metric ${key} is defined more than once with different values.`);
        }
        if (!existing) {
            definitionsByKey.set(key, definition);
            definitions.push(definition);
        }
        return `[~${key}]`;
    });

    return { normalizedText, definitions, invalidTokens, parseErrors };

    function invalid(token: string, reason: string): string {
        invalidTokens.push(token);
        parseErrors.push(`${token}: ${reason}`);
        return token;
    }
}

/** Renders canonical metric references and frontend-only definitions as display values for Visual mode. */
export function renderMetricVisualText({
    text,
    metrics = [],
    references = [],
}: {
    text: string;
    metrics?: readonly MetricView[];
    references?: readonly MetricReferenceView[];
}) {
    const parsed = parseMetricAuthoringText(text);
    const metricValues = new Map<string, string>();
    for (const metric of metrics) metricValues.set(metric.key, metric.value);
    for (const reference of references) {
        if (reference.resolved && reference.value) metricValues.set(reference.key, reference.value);
    }
    for (const definition of parsed.definitions) metricValues.set(definition.key, definition.value);

    const renderedText = text.replace(metricTokenPattern, (token, raw: string) => {
        const content = raw.trim();
        const key = normalizeMetricKey(content.includes(':=') ? content.split(':=', 1)[0] : content);
        return metricValues.get(key) ?? token;
    });

    return { ...parsed, renderedText };
}

/** Creates missing inline-defined metrics explicitly and returns backend-safe requirement description text. */
export async function materializeInlineMetricDefinitions({
    projectId,
    description,
    init,
}: {
    projectId: string | null | undefined;
    description: string;
    init?: RequestInit;
}) {
    const parsed = parseMetricAuthoringText(description);
    if (parsed.parseErrors.length > 0) throw new Error(parsed.parseErrors.join(' '));
    if (parsed.definitions.length === 0) return parsed.normalizedText;

    const trimmedProjectId = projectId?.trim();
    if (!trimmedProjectId) throw new Error('Select a project before creating inline metric definitions.');

    for (const definition of parsed.definitions) {
        try {
            const existing = await getMetricByKey(trimmedProjectId, definition.key, init);
            assertMetricMatchesDefinition(existing, definition);
        } catch (error) {
            const status = typeof error === 'object' && error && 'status' in error ? (error as { status?: number }).status : undefined;
            if (status !== 404) throw error;
            await createMetric(
                {
                    projectId: trimmedProjectId,
                    key: definition.key,
                    value: definition.value,
                    description: definition.description,
                },
                init,
            );
        }
    }

    return parsed.normalizedText;
}
