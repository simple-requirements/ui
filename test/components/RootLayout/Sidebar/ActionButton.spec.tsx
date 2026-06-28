import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ActionButton', () => {
    describe('renders', () => {
        it('the synchronize and New project buttons.', () => {
            render(<ActionButton />);

            expect(screen.getByRole('button', { name: /synchronize projects/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
        });
    });

    describe('calls', () => {
        it('calls onSynchronize when the synchronize button is clicked.', async () => {
            const user = userEvent.setup();
            const onSynchronize = vi.fn();

            render(<ActionButton onSynchronize={onSynchronize} />);

            await user.click(screen.getByRole('button', { name: /synchronize projects/i }));

            expect(onSynchronize).toHaveBeenCalledTimes(1);
        });

        it('calls onNewProject when the New project button is clicked.', async () => {
            const user = userEvent.setup();
            const onNewProject = vi.fn();

            render(<ActionButton onNewProject={onNewProject} />);

            await user.click(screen.getByRole('button', { name: /new project/i }));

            expect(onNewProject).toHaveBeenCalledTimes(1);
        });
    });
    
    it('can be clicked without callbacks.', async () => {
        const user = userEvent.setup();

        render(<ActionButton />);

        await user.click(screen.getByRole('button', { name: /synchronize projects/i }));
        await user.click(screen.getByRole('button', { name: /new project/i }));

        expect(screen.getByRole('button', { name: /synchronize projects/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
    });

    it('uses the ghost modifier for the synchronize button.', () => {
        render(<ActionButton />);

        expect(screen.getByRole('button', { name: /synchronize projects/i })).toHaveClass(
            'sidebar-action-button',
            'sidebar-action-button--ghost',
        );
    });

    it('uses the default sidebar action button class for the New project button.', () => {
        render(<ActionButton />);

        expect(screen.getByRole('button', { name: /new project/i })).toHaveClass('sidebar-action-button');
        expect(screen.getByRole('button', { name: /new project/i })).not.toHaveClass('sidebar-action-button--ghost');
    });
});
