import { useQuery } from '@tanstack/react-query';
import { metricKeys } from '@/api/queryKeys';
import { listProjectMetrics } from '@/features/metrics/api/metricsApi';

/** Loads explicit project metrics so forms can render metric references without submitting authoring syntax. */
export function useProjectMetricsQuery(projectId: string | null | undefined) {
    return useQuery({
        queryKey: projectId ? metricKeys.list(projectId) : metricKeys.list('none'),
        queryFn: ({ signal }) => listProjectMetrics(projectId ?? '', { signal }),
        enabled: Boolean(projectId),
        retry: false,
    });
}
