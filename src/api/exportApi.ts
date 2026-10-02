import { z } from 'zod';

import { apiFetch } from '@/api/fetch';

const exportCapabilitiesSchema = z.object({
    allProjects: z.boolean(),
    project: z.boolean(),
    requirementSelection: z.boolean(),
    importRoundTripReady: z.boolean(),
    renderedMetrics: z.boolean(),
    originalMetricPlaceholders: z.boolean(),
    revisionHistory: z.boolean(),
    linkHistory: z.boolean(),
});

const exportFormatSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    fileExtension: z.string().min(1),
    mediaType: z.string().min(1),
    formatClass: z.enum(['data', 'document']),
    capabilities: exportCapabilitiesSchema,
});

export type ExportFormat = z.infer<typeof exportFormatSchema>;

type ApiResponse<T> = Readonly<{ data: T; status: number; headers: Headers }>;

export async function listExportFormatsRequest(): Promise<ExportFormat[]> {
    const response = await apiFetch<ApiResponse<unknown>>('/export/formats');
    return z.array(exportFormatSchema).parse(response.data);
}

export async function downloadProjectExportRequest(projectId: string, formatId: string): Promise<void> {
    const response = await apiFetch<ApiResponse<unknown>>(
        `/export/projects/${encodeURIComponent(projectId)}?format=${encodeURIComponent(formatId)}`,
    );
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
    const filename = parseFilename(response.headers.get('content-disposition')) ?? `project-export.${formatId}`;
    const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2) + '\n';
    triggerDownload(new Blob([content], { type: contentType }), filename);
}

function parseFilename(disposition: string | null): string | undefined {
    if (disposition === null) return undefined;
    const match = /filename="([^"]+)"/u.exec(disposition);
    return match?.[1];
}

function triggerDownload(blob: Blob, filename: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
}
