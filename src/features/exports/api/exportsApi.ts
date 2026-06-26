import { apiFetch, getApiBaseUrl } from "@/api/client/config";
import type { ExportFormatResponseDto } from "@/api/generated/models";

export type ExportScope = "allProjects" | "project" | "requirements";

export interface ExportFormatView {
  id: string;
  label: string;
  fileExtension: string;
  mediaType: string;
  formatClass: "data" | "document";
  capabilities: ExportFormatResponseDto["capabilities"];
}

export interface ExportDownloadRequest {
  scope: ExportScope;
  formatId: string;
  projectId?: string | null;
  requirementIds?: readonly string[];
}

export interface ExportDownload {
  blob: Blob;
  filename: string;
  mediaType: string;
}

const defaultFilenameByScope: Record<ExportScope, string> = {
  allProjects: "requirements-export",
  project: "project-export",
  requirements: "requirements-selection-export",
};

export function mapExportFormat(
  dto: ExportFormatResponseDto,
): ExportFormatView {
  return {
    id: dto.id,
    label: dto.label,
    fileExtension: dto.fileExtension,
    mediaType: dto.mediaType,
    formatClass: dto.formatClass,
    capabilities: dto.capabilities,
  };
}

export function listExportFormats(
  init?: RequestInit,
): Promise<ExportFormatView[]> {
  return apiFetch<ExportFormatResponseDto[]>("/export/formats", init).then(
    (formats) =>
      formats
        .map(mapExportFormat)
        .sort((a, b) => a.label.localeCompare(b.label)),
  );
}

export function formatSupportsScope(
  format: ExportFormatView,
  scope: ExportScope,
): boolean {
  switch (scope) {
    case "allProjects":
      return format.capabilities.supportsAllProjects;
    case "project":
      return format.capabilities.supportsProject;
    case "requirements":
      return format.capabilities.supportsRequirements;
  }
}

export function supportedFormatsForScope(
  formats: readonly ExportFormatView[],
  scope: ExportScope,
) {
  return formats.filter((format) => formatSupportsScope(format, scope));
}

export function buildExportPath(request: ExportDownloadRequest): string {
  const format = encodeURIComponent(request.formatId);

  switch (request.scope) {
    case "allProjects":
      return `/export/projects?format=${format}`;
    case "project": {
      if (!request.projectId)
        throw new Error("Select a project before exporting it.");
      return `/export/projects/${encodeURIComponent(request.projectId)}?format=${format}`;
    }
    case "requirements": {
      const ids = [...(request.requirementIds ?? [])].filter(
        (id) => id.trim().length > 0,
      );
      if (ids.length === 0)
        throw new Error(
          "Select at least one requirement before exporting a selection.",
        );
      const encodedIds = encodeURIComponent(ids.join(","));
      return `/export/requirements?id=${encodedIds}&format=${format}`;
    }
  }
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;

  const utf8Filename = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1];
  if (utf8Filename) return decodeURIComponent(utf8Filename.replace(/"/g, ""));

  const quotedFilename = /filename="([^"]+)"/i.exec(header)?.[1];
  if (quotedFilename) return quotedFilename;

  const tokenFilename = /filename=([^;]+)/i.exec(header)?.[1]?.trim();
  return tokenFilename ? tokenFilename.replace(/"/g, "") : null;
}

function defaultFilename(request: ExportDownloadRequest, mediaType: string) {
  const extension = mediaType.includes("asciidoc")
    ? "adoc"
    : mediaType.includes("markdown")
      ? "md"
      : request.formatId === "asciidoc"
        ? "adoc"
        : request.formatId === "github-markdown"
          ? "md"
          : request.formatId;
  return `${defaultFilenameByScope[request.scope]}.${extension}`;
}

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  if (!text) return new Error(response.statusText || "Export failed.");

  try {
    const parsed = JSON.parse(text) as {
      message?: string | string[];
      error?: string;
    };
    const message = Array.isArray(parsed.message)
      ? parsed.message.join(", ")
      : parsed.message;
    return new Error(message ?? parsed.error ?? text);
  } catch {
    return new Error(text);
  }
}

/** Downloads one export document in the exact media type returned by the backend adapter. */
export async function downloadExport(
  request: ExportDownloadRequest,
  init?: RequestInit,
): Promise<ExportDownload> {
  const response = await fetch(
    `${getApiBaseUrl()}${buildExportPath(request)}`,
    init,
  );

  if (!response.ok) throw await parseError(response);

  const mediaType =
    response.headers.get("Content-Type") ?? "application/octet-stream";
  const filename =
    filenameFromContentDisposition(
      response.headers.get("Content-Disposition"),
    ) ?? defaultFilename(request, mediaType);

  return { blob: await response.blob(), filename, mediaType };
}

/** Saves a browser Blob using an object URL without exposing backend response internals to components. */
export function saveBlobDownload(download: ExportDownload): void {
  const url = URL.createObjectURL(download.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = download.filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
