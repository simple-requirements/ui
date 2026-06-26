import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    buildExportPath,
    downloadExport,
    formatSupportsScope,
    listExportFormats,
    mapExportFormat,
    supportedFormatsForScope,
    type ExportFormatView,
} from '@/features/exports/api/exportsApi';

const format = (id: string, overrides: Partial<ExportFormatView['capabilities']> = {}): ExportFormatView =>
    mapExportFormat({
        id,
        label: id,
        fileExtension:
            id === 'asciidoc' ? 'adoc'
            : id === 'github-markdown' ? 'md'
            : 'json',
        mediaType: id === 'json' ? 'application/json' : 'text/plain',
        formatClass: id === 'json' ? 'data' : 'document',
        capabilities: {
            supportsAllProjects: true,
            supportsProject: true,
            supportsRequirements: true,
            supportsImportRoundTrip: id === 'json',
            supportsRenderedMetrics: id !== 'json',
            supportsOriginalMetricPlaceholders: true,
            supportsRevisionHistory: true,
            supportsLinkHistory: true,
            ...overrides,
        },
    });

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('export controls API helpers', () => {
    it('filters live backend formats by scope capability', () => {
        const json = format('json');
        const projectOnly = format('project-only', { supportsAllProjects: false, supportsRequirements: false });
        const formats = [json, projectOnly];

        expect(supportedFormatsForScope(formats, 'allProjects').map((item) => item.id)).toEqual(['json']);
        expect(supportedFormatsForScope(formats, 'project').map((item) => item.id)).toEqual(['json', 'project-only']);
        expect(formatSupportsScope(projectOnly, 'requirements')).toBe(false);
    });

    it('builds backend export paths for discovered non-json adapter ids', () => {
        expect(buildExportPath({ scope: 'allProjects', formatId: 'github-markdown' })).toBe(
            '/export/projects?format=github-markdown',
        );
        expect(buildExportPath({ scope: 'project', formatId: 'asciidoc', projectId: 'project 1' })).toBe(
            '/export/projects/project%201?format=asciidoc',
        );
        expect(buildExportPath({ scope: 'requirements', formatId: 'json', requirementIds: ['r1', 'r2'] })).toBe(
            '/export/requirements?id=r1%2Cr2&format=json',
        );
    });

    it('requires a project or selected requirement for scoped exports', () => {
        expect(() => buildExportPath({ scope: 'project', formatId: 'json' })).toThrow(
            'Select a project before exporting it.',
        );
        expect(() => buildExportPath({ scope: 'requirements', formatId: 'json', requirementIds: [] })).toThrow(
            'Select at least one requirement before exporting a selection.',
        );
    });

    it('loads and sorts live backend export formats', async () => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://backend.test');
        const fetchMock = vi.fn<typeof fetch>();

        fetchMock.mockResolvedValue(
            new Response(
                JSON.stringify([
                    {
                        id: 'github-markdown',
                        label: 'GitHub Markdown',
                        fileExtension: 'md',
                        mediaType: 'text/markdown',
                        formatClass: 'document',
                        capabilities: {
                            supportsAllProjects: true,
                            supportsProject: true,
                            supportsRequirements: true,
                            supportsImportRoundTrip: false,
                            supportsRenderedMetrics: true,
                            supportsOriginalMetricPlaceholders: true,
                            supportsRevisionHistory: true,
                            supportsLinkHistory: true,
                        },
                    },
                    {
                        id: 'asciidoc',
                        label: 'AsciiDoc',
                        fileExtension: 'adoc',
                        mediaType: 'text/asciidoc',
                        formatClass: 'document',
                        capabilities: {
                            supportsAllProjects: true,
                            supportsProject: true,
                            supportsRequirements: true,
                            supportsImportRoundTrip: false,
                            supportsRenderedMetrics: true,
                            supportsOriginalMetricPlaceholders: true,
                            supportsRevisionHistory: true,
                            supportsLinkHistory: true,
                        },
                    },
                ]),
                { headers: { 'Content-Type': 'application/json' } },
            ),
        );
        vi.stubGlobal('fetch', fetchMock);

        const formats = await listExportFormats();

        expect(fetchMock).toHaveBeenCalledWith('http://backend.test/export/formats', undefined);
        expect(formats.map((item) => item.id)).toEqual(['asciidoc', 'github-markdown']);
    });

    it('downloads discovered document formats with backend filenames', async () => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://backend.test');
        const fetchMock = vi.fn<typeof fetch>();

        fetchMock.mockResolvedValue(
            new Response('# Export', {
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="project-export.md"',
                },
            }),
        );
        vi.stubGlobal('fetch', fetchMock);

        const download = await downloadExport({
            scope: 'project',
            formatId: 'github-markdown',
            projectId: 'project 1',
        });

        expect(fetchMock).toHaveBeenCalledWith(
            'http://backend.test/export/projects/project%201?format=github-markdown',
            undefined,
        );
        expect(download.filename).toBe('project-export.md');
        expect(download.mediaType).toBe('text/markdown; charset=utf-8');
        expect(await download.blob.text()).toBe('# Export');
    });
});
