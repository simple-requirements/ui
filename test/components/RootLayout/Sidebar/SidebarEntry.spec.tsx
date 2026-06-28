import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SidebarEntry } from '@/components/RootLayout/Sidebar/SidebarEntry';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('SidebarEntry', () => {
    it('renders the project name and requirement count.', () => {
        render(
            <SidebarEntry
                projectName='Reporting and Analytics'
                requirementCount={60}
            />,
        );

        expect(screen.getByRole('button', { name: /reporting and analytics/i })).not.toBeNull();
        expect(screen.getByText('60')).not.toBeNull();
    });

    it('renders a closed folder icon for a non-selected project.', () => {
        render(
            <SidebarEntry
                projectName='Reporting and Analytics'
                requirementCount={60}
            />,
        );

        const button = screen.getByRole('button', { name: /reporting and analytics/i });
        const icon = button.querySelector('.sidebar-entry__icon');

        expect(icon).not.toBeNull();
        expect(icon?.classList.contains('pi-folder')).toBe(true);
        expect(icon?.classList.contains('pi-folder-open')).toBe(false);
    });

    it('renders an open folder icon for a selected project.', () => {
        render(
            <SidebarEntry
                projectName='Reporting and Analytics'
                requirementCount={60}
                selected
            />,
        );

        const button = screen.getByRole('button', { name: /reporting and analytics/i });
        const icon = button.querySelector('.sidebar-entry__icon');

        expect(icon).not.toBeNull();
        expect(icon?.classList.contains('pi-folder-open')).toBe(true);
        expect(icon?.classList.contains('pi-folder')).toBe(false);
    });

    it('marks a selected project with aria-current and the selected class.', () => {
        render(
            <SidebarEntry
                projectName='Reporting and Analytics'
                requirementCount={60}
                selected
            />,
        );

        const button = screen.getByRole('button', { name: /reporting and analytics/i });

        expect(button.getAttribute('aria-current')).toBe('page');
        expect(button.classList.contains('sidebar-entry--selected')).toBe(true);
    });

    it('does not mark a non-selected project with aria-current.', () => {
        render(
            <SidebarEntry
                projectName='Reporting and Analytics'
                requirementCount={60}
            />,
        );

        const button = screen.getByRole('button', { name: /reporting and analytics/i });

        expect(button.getAttribute('aria-current')).toBeNull();
        expect(button.classList.contains('sidebar-entry--selected')).toBe(false);
    });

    it('calls onClick when the entry is clicked.', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <SidebarEntry
                projectName='Reporting and Analytics'
                requirementCount={60}
                onClick={onClick}
            />,
        );

        await user.click(screen.getByRole('button', { name: /reporting and analytics/i }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders large requirement counts.', () => {
        render(
            <SidebarEntry
                projectName='Platform Foundation'
                requirementCount={1234}
            />,
        );

        expect(screen.getByRole('button', { name: /platform foundation/i })).not.toBeNull();
        expect(screen.getByText('1234')).not.toBeNull();
    });
});