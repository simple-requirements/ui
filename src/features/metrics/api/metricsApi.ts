import { apiFetch } from '@/api/client/config';
import { getGetMetricsKeyKeyUrl, getGetMetricsUrl, getPostMetricsUrl } from '@/api/generated/endpoints/metrics/metrics';
import type { CreateMetricDto, MetricResponseDto } from '@/api/generated/models';
import type { MetricView } from '@/types/domain';

const jsonRequestInit = (init: RequestInit | undefined, method: 'POST', body: unknown): RequestInit => {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    return { ...init, method, headers, body: JSON.stringify(body) };
};

export const metricKeyPattern = /^MET-[0-9]{4}$/;
export const normalizeMetricKey = (key: string) => key.trim().toUpperCase();
export const validateMetricKey = (key: string) => metricKeyPattern.test(normalizeMetricKey(key));

export function mapMetric(dto: MetricResponseDto): MetricView {
    return {
        id: dto.id,
        projectId: dto.projectId,
        key: dto.key,
        value: dto.value,
        description: dto.description,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

export async function listProjectMetrics(projectId: string, init?: RequestInit): Promise<MetricView[]> {
    return apiFetch<MetricResponseDto[]>(getGetMetricsUrl({ projectId }), init).then((metrics) =>
        metrics.map(mapMetric).sort((a, b) => a.key.localeCompare(b.key)),
    );
}

export async function getMetricByKey(projectId: string, key: string, init?: RequestInit): Promise<MetricView> {
    return apiFetch<MetricResponseDto>(getGetMetricsKeyKeyUrl(normalizeMetricKey(key), { projectId }), init).then(
        mapMetric,
    );
}

export async function createMetric(dto: CreateMetricDto, init?: RequestInit): Promise<MetricView> {
    return apiFetch<MetricResponseDto>(getPostMetricsUrl(), jsonRequestInit(init, 'POST', dto)).then(mapMetric);
}
