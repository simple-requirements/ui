import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';

import { getListProjectMetricsQueryKey, listProjectMetricsRequest, metricSchema, type Metric } from '@/api/metricsApi';
import { queryClient } from '@/api/queryClient';

function createProjectMetricsCollection(projectId: string) {
    return createCollection(
        queryCollectionOptions({
            id: `project-metrics:${projectId}`,
            queryKey: getListProjectMetricsQueryKey(projectId),
            queryClient,
            getKey: (metric) => metric.id,
            schema: metricSchema,
            queryFn: () => listProjectMetricsRequest(projectId),
            retry: false,
        }),
    );
}

export type ProjectMetricsCollection = ReturnType<typeof createProjectMetricsCollection>;

/** Writes one metric into the project metrics query cache so mutation results are immediately visible. */
export function cacheProjectMetric(projectId: string, metric: Metric): void {
    queryClient.setQueryData<Metric[]>(getListProjectMetricsQueryKey(projectId), (current) => {
        if (current === undefined) return [metric];
        const existingIndex = current.findIndex((candidate) => candidate.id === metric.id);
        if (existingIndex === -1) return [...current, metric].sort((a, b) => a.key.localeCompare(b.key));

        return current.map((candidate) => candidate.id === metric.id ? metric : candidate);
    });
}

const projectMetricsCollections = new Map<string, ProjectMetricsCollection>();

export function getProjectMetricsCollection(projectId: string): ProjectMetricsCollection {
    const existing = projectMetricsCollections.get(projectId);
    if (existing !== undefined) return existing;

    const collection = createProjectMetricsCollection(projectId);
    projectMetricsCollections.set(projectId, collection);
    return collection;
}

/** Clears all project-scoped metric rows at an authentication boundary. */
export async function resetProjectMetricsCollections(): Promise<void> {
    await Promise.all([...projectMetricsCollections.values()].map((collection) => collection.cleanup()));
    projectMetricsCollections.clear();
}
