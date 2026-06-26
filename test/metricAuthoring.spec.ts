import { describe, expect, it } from 'vitest';
import { parseMetricAuthoringText, renderMetricVisualText } from '@/features/requirements/metrics/metricAuthoring';

describe('metric authoring helpers', () => {
    it('normalizes plain metric references without creating definitions', () => {
        const result = parseMetricAuthoringText('Latency [ ~met-0001 ]');

        expect(result.normalizedText).toBe('Latency [~MET-0001]');
        expect(result.definitions).toEqual([]);
        expect(result.parseErrors).toEqual([]);
    });

    it('parses inline metric definitions and rewrites them to canonical references', () => {
        const result = parseMetricAuthoringText('Latency [~MET-0001 := 2000 ms | Max. latency]');

        expect(result.normalizedText).toBe('Latency [~MET-0001]');
        expect(result.definitions).toEqual([{ key: 'MET-0001', value: '2000 ms', description: 'Max. latency' }]);
    });

    it('rejects conflicting duplicate inline definitions for the same key', () => {
        const result = parseMetricAuthoringText('[~MET-0001 := 2000 ms] [~MET-0001 := 1000 ms]');

        expect(result.parseErrors[0]).toContain('defined more than once');
    });

    it('renders ordinary typing text without metric placeholders', () => {
        const result = renderMetricVisualText({ text: 'The system shall keep rendering while I type.' });

        expect(result.renderedText).toBe('The system shall keep rendering while I type.');
        expect(result.parseErrors).toEqual([]);
    });

    it('renders visual text with inline values and resolved existing metric references', () => {
        const result = renderMetricVisualText({
            text: 'Latency [~MET-0001 := 2000 ms] and throughput [~MET-0002]',
            references: [{ id: 'metric-2', key: 'MET-0002', value: '500 req/s', description: null, resolved: true }],
        });

        expect(result.renderedText).toBe('Latency 2000 ms and throughput 500 req/s');
    });
});
