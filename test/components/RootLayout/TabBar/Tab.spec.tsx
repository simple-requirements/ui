import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Tab } from '@/components/RootLayout/TabBar/Tab';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Tab', () => {
    it('renders the tab group, select button, and close button.', () => {
        render(<Tab label='Project overview' />);

        expect(screen.getByRole('group', { name: /project overview tab/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^project overview$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^close project overview tab$/i })).toBeInTheDocument();
    });

    it('hides the close button when the tab is not closable.', () => {
        render(
            <Tab
                label='Workspace'
                closable={false}
            />,
        );

        expect(screen.getByRole('button', { name: /^workspace$/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^close workspace tab$/i })).not.toBeInTheDocument();
    });

    it('calls onClick when the select button is clicked.', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <Tab
                label='Project overview'
                onClick={onClick}
            />,
        );

        await user.click(screen.getByRole('button', { name: /^project overview$/i }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the close button is clicked.', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <Tab
                label='Project overview'
                onClose={onClose}
            />,
        );

        await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when the close button is clicked.', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        const onClose = vi.fn();

        render(
            <Tab
                label='Project overview'
                onClick={onClick}
                onClose={onClose}
            />,
        );

        await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('exposes the active tab with aria-current.', () => {
        render(
            <Tab
                label='Workspace'
                active
            />,
        );

        expect(screen.getByRole('button', { name: /^workspace$/i })).toHaveAttribute('aria-current', 'page');
    });

    it('does not expose aria-current for an inactive tab.', () => {
        render(<Tab label='Project overview' />);

        expect(screen.getByRole('button', { name: /^project overview$/i })).not.toHaveAttribute('aria-current');
    });
});
