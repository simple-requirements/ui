import { z } from 'zod';

import {
    createMetric as createGeneratedMetric,
    deactivateMetric as deactivateGeneratedMetric,
    getListMetricsQueryKey,
    listMetrics as listGeneratedMetrics,
    updateMetric as updateGeneratedMetric,
} from '@/api/generated/metrics/metrics';

export const metricSchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    key: z.string().regex(/^MET-[0-9]{4}$/u),
    value: z.string().min(1),
    description: z.string(),
    active: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const createMetricRequestSchema = z.object({
    value: z.string().trim().min(1, 'Value is required.'),
    description: z.string().trim(),
});

export const updateMetricRequestSchema = createMetricRequestSchema;

export type Metric = z.infer<typeof metricSchema>;
export type CreateMetricRequest = z.infer<typeof createMetricRequestSchema>;
export type UpdateMetricRequest = z.infer<typeof updateMetricRequestSchema>;

const metricsResponseSchema = z.array(metricSchema);

export { getListMetricsQueryKey as getListProjectMetricsQueryKey };

export async function listProjectMetricsRequest(projectId: string): Promise<Metric[]> {
    const response = await listGeneratedMetrics(projectId);
    return metricsResponseSchema.parse(response.data);
}

export async function createProjectMetricRequest(projectId: string, input: CreateMetricRequest): Promise<Metric> {
    const response = await createGeneratedMetric(projectId, input);
    return metricSchema.parse(response.data);
}

export async function updateProjectMetricRequest(
    projectId: string,
    metricId: string,
    input: UpdateMetricRequest,
): Promise<Metric> {
    const response = await updateGeneratedMetric(projectId, metricId, input);
    return metricSchema.parse(response.data);
}

export async function deactivateProjectMetricRequest(projectId: string, metricId: string): Promise<Metric> {
    const response = await deactivateGeneratedMetric(projectId, metricId);
    return metricSchema.parse(response.data);
}
