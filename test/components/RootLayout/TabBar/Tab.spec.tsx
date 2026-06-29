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

    it('marks an active tab.', () => {
        render(
            <Tab
                label='Workspace'
                active
            />,
        );

        const tabGroup = screen.getByRole('group', { name: /workspace tab/i });
        const selectButton = screen.getByRole('button', { name: /^workspace$/i });

        expect(tabGroup).toHaveClass('tab--active');
        expect(selectButton).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark an inactive tab as active.', () => {
        render(<Tab label='Project overview' />);

        const tabGroup = screen.getByRole('group', { name: /project overview tab/i });
        const selectButton = screen.getByRole('button', { name: /^project overview$/i });

        expect(tabGroup).not.toHaveClass('tab--active');
        expect(selectButton).not.toHaveAttribute('aria-current');
    });

    it('marks a fixed tab.', () => {
        render(
            <Tab
                label='Workspace'
                fixed
            />,
        );

        expect(screen.getByRole('group', { name: /workspace tab/i })).toHaveClass('tab--fixed');
    });

    it('does not mark a normal tab as fixed.', () => {
        render(<Tab label='Project overview' />);

        expect(screen.getByRole('group', { name: /project overview tab/i })).not.toHaveClass('tab--fixed');
    });

    it('uses the base tab class.', () => {
        render(<Tab label='Project overview' />);

        expect(screen.getByRole('group', { name: /project overview tab/i })).toHaveClass('tab');
    });
});
