import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SidebarProject } from '@/api/collections/projectsCollection';
import { queryClient } from '@/api/queryClient';
import { useProjectDialogController } from '@/components/RootLayout/Sidebar/useProjectDialogController';

const project: SidebarProject = {
    id: 'project-alpha',
    name: 'Alpha Project',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-28T10:00:00.000Z',
    ticketUrlTemplate: null,
    requirementCount: 4,
};

type ProjectSubmitData = Readonly<{ name: string }>;

const mocks = vi.hoisted(() => ({
    createProjectRequest: vi.fn<(data: ProjectSubmitData) => Promise<void>>(),
    updateProjectRequest: vi.fn<(projectId: string, data: ProjectSubmitData) => Promise<void>>(),
}));

vi.mock('@/api/projectsApi', () => ({
    createProjectRequest: mocks.createProjectRequest,
    updateProjectRequest: mocks.updateProjectRequest,
}));

function ProjectDialogControllerProbe() {
    const controller = useProjectDialogController();

    return (
        <div>
            <output aria-label='Dialog visible'>{controller.visible ? 'visible' : 'hidden'}</output>
            <output aria-label='Dialog mode'>{controller.mode}</output>
            <output aria-label='Initial name'>{controller.initialName}</output>
            <output aria-label='Pending'>{controller.pending ? 'pending' : 'idle'}</output>
            <output aria-label='Error message'>{controller.errorMessage ?? 'none'}</output>
            <button
                type='button'
                onClick={controller.openCreateProjectDialog}>
                Open create
            </button>
            <button
                type='button'
                onClick={() => controller.openRenameProjectDialog(project)}>
                Open rename
            </button>
            <button
                type='button'
                onClick={controller.cancelProjectDialog}>
                Cancel
            </button>
            <button
                type='button'
                onClick={() => {
                    void controller.submitProjectDialog({ name: 'Created project' }).catch(() => undefined);
                }}>
                Submit create data
            </button>
            <button
                type='button'
                onClick={() => {
                    void controller.submitProjectDialog({ name: 'Renamed project' }).catch(() => undefined);
                }}>
                Submit rename data
            </button>
        </div>
    );
}

function renderProjectDialogControllerProbe(): ReturnType<typeof render> {
    const reactQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

    return render(
        <QueryClientProvider client={reactQueryClient}>
            <ProjectDialogControllerProbe />
        </QueryClientProvider>,
    );
}

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe('useProjectDialogController', () => {
    it('opens and cancels the create dialog.', async () => {
        const user = userEvent.setup();

        renderProjectDialogControllerProbe();

        await user.click(screen.getByRole('button', { name: /open create/i }));

        expect(screen.getByLabelText('Dialog visible')).toHaveTextContent('visible');
        expect(screen.getByLabelText('Dialog mode')).toHaveTextContent('create');
        expect(screen.getByLabelText('Initial name')).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(screen.getByLabelText('Dialog visible')).toHaveTextContent('hidden');
    });

    it('creates a project and closes the dialog after the project list is invalidated.', async () => {
        const user = userEvent.setup();
        mocks.createProjectRequest.mockResolvedValue(undefined);
        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);

        renderProjectDialogControllerProbe();

        await user.click(screen.getByRole('button', { name: /open create/i }));
        await user.click(screen.getByRole('button', { name: /submit create data/i }));

        await waitFor(() => {
            expect(mocks.createProjectRequest).toHaveBeenCalledWith({ name: 'Created project' });
        });
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['/projects'] });

        await waitFor(() => {
            expect(screen.getByLabelText('Dialog visible')).toHaveTextContent('hidden');
        });
    });

    it('opens a rename dialog with the selected project name and updates that project.', async () => {
        const user = userEvent.setup();
        mocks.updateProjectRequest.mockResolvedValue(undefined);
        vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);

        renderProjectDialogControllerProbe();

        await user.click(screen.getByRole('button', { name: /open rename/i }));

        expect(screen.getByLabelText('Dialog visible')).toHaveTextContent('visible');
        expect(screen.getByLabelText('Dialog mode')).toHaveTextContent('rename');
        expect(screen.getByLabelText('Initial name')).toHaveTextContent('Alpha Project');

        await user.click(screen.getByRole('button', { name: /submit rename data/i }));

        await waitFor(() => {
            expect(mocks.updateProjectRequest).toHaveBeenCalledWith('project-alpha', { name: 'Renamed project' });
        });
        await waitFor(() => {
            expect(screen.getByLabelText('Dialog visible')).toHaveTextContent('hidden');
        });
    });

    it('keeps the dialog open and exposes the error message when saving fails.', async () => {
        const user = userEvent.setup();
        mocks.createProjectRequest.mockRejectedValue(new Error('The project could not be saved.'));

        renderProjectDialogControllerProbe();

        await user.click(screen.getByRole('button', { name: /open create/i }));
        await user.click(screen.getByRole('button', { name: /submit create data/i }));

        await waitFor(() => {
            expect(screen.getByLabelText('Error message')).toHaveTextContent('The project could not be saved.');
        });
        expect(screen.getByLabelText('Dialog visible')).toHaveTextContent('visible');
    });
});
