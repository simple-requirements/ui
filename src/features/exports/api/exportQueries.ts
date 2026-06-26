import { useMutation, useQuery } from '@tanstack/react-query';
import {
    downloadExport,
    listExportFormats,
    saveBlobDownload,
    type ExportDownloadRequest,
} from '@/features/exports/api/exportsApi';

const exportFormatsQueryKey = ['exports', 'formats'] as const;

/** Loads backend-advertised export formats instead of relying on generated static enum values. */
export function useExportFormatsQuery() {
    return useQuery({
        queryKey: exportFormatsQueryKey,
        queryFn: ({ signal }) => listExportFormats({ signal }),
        retry: false,
    });
}

/** Downloads one export and hands it to the browser as a file. */
export function useExportDownloadMutation() {
    return useMutation({
        mutationFn: (request: ExportDownloadRequest) => downloadExport(request),
        onSuccess: saveBlobDownload,
    });
}
