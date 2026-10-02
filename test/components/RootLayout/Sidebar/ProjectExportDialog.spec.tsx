import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProjectExportDialog } from '@/components/RootLayout/Sidebar/ProjectExportDialog';

const mocks = vi.hoisted(() => ({ listFormats: vi.fn(), download: vi.fn() }));

vi.mock('@/api/exportApi', () => ({
    listExportFormatsRequest: mocks.listFormats,
    downloadProjectExportRequest: mocks.download,
}));

function renderDialog(onClose = vi.fn()) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return {
        onClose,
        ...render(
            <QueryClientProvider client={queryClient}>
                <ProjectExportDialog
                    visible
                    projectId='11111111-1111-4111-8111-111111111111'
                    projectName='Example Project'
                    onClose={onClose}
                />
            </QueryClientProvider>,
        ),
    };
}

describe('ProjectExportDialog', () => {
    it('loads formats and exports the selected project.', async () => {
        mocks.listFormats.mockResolvedValue([
            {
                id: 'json',
                label: 'JSON',
                fileExtension: 'json',
                mediaType: 'application/json',
                formatClass: 'data',
                capabilities: {
                    allProjects: true,
                    project: true,
                    requirementSelection: true,
                    importRoundTripReady: false,
                    renderedMetrics: true,
                    originalMetricPlaceholders: true,
                    revisionHistory: true,
                    linkHistory: false,
                },
            },
        ]);
        mocks.download.mockResolvedValue(undefined);
        const { onClose } = renderDialog();
        const user = userEvent.setup();

        expect(await screen.findByText(/Export Example Project/)).toBeInTheDocument();
        await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled());
        await user.click(screen.getByRole('button', { name: 'Export' }));

        await waitFor(() =>
            expect(mocks.download).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', 'json'),
        );
        expect(onClose).toHaveBeenCalled();
    });
});
