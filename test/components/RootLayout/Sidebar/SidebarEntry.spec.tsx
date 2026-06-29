import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SidebarEntry } from '@/components/RootLayout/Sidebar/SidebarEntry';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('SidebarEntry', () => {
    describe('renders', () => {
        it('the project name and requirement count.', () => {
            render(
                <SidebarEntry
                    projectName='Reporting and Analytics'
                    requirementCount={60}
                />,
            );

            expect(screen.getByRole('button', { name: /reporting and analytics/i })).toBeInTheDocument();
            expect(screen.getByText('60')).toBeInTheDocument();
        });

        it.for([
            {
                testName: 'a closed folder icon for a non-selected project',
                selected: false,
                expectedIconClassName: 'pi-folder',
                unexpectedIconClassName: 'pi-folder-open',
            },
            {
                testName: 'an open folder icon for a selected project',
                selected: true,
                expectedIconClassName: 'pi-folder-open',
                unexpectedIconClassName: 'pi-folder',
            },
        ])('$testName.', ({ selected, expectedIconClassName, unexpectedIconClassName }) => {
            render(
                <SidebarEntry
                    projectName='Reporting and Analytics'
                    requirementCount={60}
                    selected={selected}
                />,
            );

            const button = screen.getByRole('button', { name: /reporting and analytics/i });
            const icon = button.querySelector('.sidebar-entry__icon');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass(expectedIconClassName);
            expect(icon).not.toHaveClass(unexpectedIconClassName);
        });
    });

    describe('marks / does not mark', () => {
        it.for([
            {
                testName: 'marks a selected project with aria-current and the selected class',
                selected: true,
                expectedAriaCurrent: 'page',
                expectedSelectedClass: true,
            },
            {
                testName: 'does not mark a non-selected project with aria-current',
                selected: false,
                expectedAriaCurrent: null,
                expectedSelectedClass: false,
            },
        ])('$testName.', ({ selected, expectedAriaCurrent, expectedSelectedClass }) => {
            render(
                <SidebarEntry
                    projectName='Reporting and Analytics'
                    requirementCount={60}
                    selected={selected}
                />,
            );

            const button = screen.getByRole('button', { name: /reporting and analytics/i });

            expect(button.getAttribute('aria-current')).toBe(expectedAriaCurrent);

            if (expectedSelectedClass) {
                expect(button).toHaveClass('sidebar-entry--selected');
            } else {
                expect(button).not.toHaveClass('sidebar-entry--selected');
            }
        });
    });

    describe('calls', () => {
        it('onClick when the entry is clicked.', async () => {
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

        it('onContextMenu when the entry is right-clicked.', () => {
            const onContextMenu = vi.fn();

            render(
                <SidebarEntry
                    projectName='Reporting and Analytics'
                    requirementCount={60}
                    onContextMenu={onContextMenu}
                />,
            );

            fireEvent.contextMenu(screen.getByRole('button', { name: /reporting and analytics/i }));

            expect(onContextMenu).toHaveBeenCalledTimes(1);
        });
    });
});
