import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProjectDialog } from '@/components/RootLayout/Sidebar/ProjectDialog';

type ProjectDialogProps = ComponentProps<typeof ProjectDialog>;

function renderProjectDialog(overrides: Partial<ProjectDialogProps> = {}) {
    const props: ProjectDialogProps = {
        visible: true,
        mode: 'create',
        onCancel: vi.fn<ProjectDialogProps['onCancel']>(),
        onSubmit: vi.fn<ProjectDialogProps['onSubmit']>(),
        ...overrides,
    };

    return { ...render(<ProjectDialog {...props} />), props };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectDialog', () => {
    it('does not render dialog content when visible is false.', () => {
        renderProjectDialog({ visible: false });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /create project/i })).not.toBeInTheDocument();
    });

    it('renders the Create project heading in create mode.', () => {
        renderProjectDialog({ mode: 'create' });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /create project/i })).toBeInTheDocument();
    });

    it('renders the Rename project heading in rename mode.', () => {
        renderProjectDialog({ mode: 'rename' });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /rename project/i })).toBeInTheDocument();
    });

    it('starts with an empty input in create mode.', () => {
        renderProjectDialog({ mode: 'create' });

        expect(screen.getByLabelText(/project name/i)).toHaveValue('');
    });

    it('uses initialName as input value.', () => {
        renderProjectDialog({ mode: 'rename', initialName: 'Existing project' });

        expect(screen.getByLabelText(/project name/i)).toHaveValue('Existing project');
    });

    it('shows a validation error when submitting an empty project name.', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn<ProjectDialogProps['onSubmit']>();

        renderProjectDialog({ onSubmit });

        await user.click(screen.getByRole('button', { name: /^create$/i }));

        expect(await screen.findByText('Project name is required.')).toBeInTheDocument();
        expect(screen.getByLabelText(/project name/i)).toHaveAttribute('aria-invalid', 'true');
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows a validation error when submitting a whitespace-only project name.', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn<ProjectDialogProps['onSubmit']>();

        renderProjectDialog({ onSubmit });

        await user.type(screen.getByLabelText(/project name/i), '   ');
        await user.click(screen.getByRole('button', { name: /^create$/i }));

        expect(await screen.findByText('Project name is required.')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with the trimmed project name.', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn<ProjectDialogProps['onSubmit']>();

        renderProjectDialog({ onSubmit });

        await user.type(screen.getByLabelText(/project name/i), '  My project  ');
        await user.click(screen.getByRole('button', { name: /^create$/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ name: 'My project' });
        });
    });

    it('calls onCancel when Cancel is clicked.', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn<ProjectDialogProps['onCancel']>();

        renderProjectDialog({ onCancel });

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables the buttons and shows Creating while pending in create mode.', () => {
        renderProjectDialog({ mode: 'create', pending: true });

        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    it('disables the buttons and shows Renaming while pending in rename mode.', () => {
        renderProjectDialog({ mode: 'rename', pending: true });

        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /renaming/i })).toBeDisabled();
    });

    it('does not call onCancel while pending.', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn<ProjectDialogProps['onCancel']>();

        renderProjectDialog({ pending: true, onCancel });

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('renders an error message from the parent.', () => {
        renderProjectDialog({ errorMessage: 'The project could not be saved.' });

        expect(screen.getByText('The project could not be saved.')).toBeInTheDocument();
        expect(screen.getByLabelText(/project name/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not render a close button.', () => {
        renderProjectDialog();

        expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });
});
