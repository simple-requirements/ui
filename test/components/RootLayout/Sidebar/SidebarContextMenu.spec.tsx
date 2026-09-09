import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';
import type { ContextMenu } from 'primereact/contextmenu';

type MockMenuItem = Readonly<{ label?: string; icon?: string; separator?: boolean; command?: () => void }>;

type MockContextMenuProps = Readonly<{
    model: readonly MockMenuItem[];
    className?: string;
    pt?: Readonly<{ root?: Readonly<{ className?: string }> }>;
}>;

vi.mock('primereact/contextmenu', () => ({
    ContextMenu: ({ model, className, pt }: MockContextMenuProps) => (
        <nav
            aria-label='Sidebar context menu'
            className={className ?? pt?.root?.className}>
            {model.map((item) => {
                if (item.separator === true) {
                    return (
                        <hr
                            key='separator-delete-export'
                            role='separator'
                        />
                    );
                }

                return (
                    <button
                        key={item.label}
                        type='button'
                        role='menuitem'
                        onClick={item.command}>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    ),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('SidebarContextMenu', () => {
    describe('renders', () => {
        it('all context menu entries in the expected order.', () => {
            const contextMenuRef = createRef<ContextMenu>();

            render(<SidebarContextMenu contextMenuRef={contextMenuRef} canAdministerProjects />);

            const menuItems = screen.getAllByRole('menuitem');

            expect(menuItems.map((menuItem) => menuItem.textContent.trim())).toEqual([
                'Rename project',
                'Delete project',
                'Export project',
                'Export all projects',
            ]);
        });

        it('a separator between delete and export actions.', () => {
            const contextMenuRef = createRef<ContextMenu>();

            render(<SidebarContextMenu contextMenuRef={contextMenuRef} canAdministerProjects />);

            expect(screen.getAllByRole('separator')).toHaveLength(1);
        });
    });

    it('hides project administration entries for non-Administrators.', () => {
        const contextMenuRef = createRef<ContextMenu>();

        render(<SidebarContextMenu contextMenuRef={contextMenuRef} canAdministerProjects={false} />);

        expect(screen.queryByRole('menuitem', { name: /rename project/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: /delete project/i })).not.toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /^export project$/i })).toBeInTheDocument();
    });

    it('calls the matching handler when an entry is clicked.', async () => {
        const user = userEvent.setup();
        const contextMenuRef = createRef<ContextMenu>();

        const onRenameProject = vi.fn();
        const onDeleteProject = vi.fn();
        const onExportProject = vi.fn();
        const onExportAllProjects = vi.fn();

        render(
            <SidebarContextMenu
                contextMenuRef={contextMenuRef}
                canAdministerProjects
                onRenameProject={onRenameProject}
                onDeleteProject={onDeleteProject}
                onExportProject={onExportProject}
                onExportAllProjects={onExportAllProjects}
            />,
        );

        await user.click(screen.getByRole('menuitem', { name: /rename project/i }));
        await user.click(screen.getByRole('menuitem', { name: /delete project/i }));
        await user.click(screen.getByRole('menuitem', { name: /^export project$/i }));
        await user.click(screen.getByRole('menuitem', { name: /export all projects/i }));

        expect(onRenameProject).toHaveBeenCalledTimes(1);
        expect(onDeleteProject).toHaveBeenCalledTimes(1);
        expect(onExportProject).toHaveBeenCalledTimes(1);
        expect(onExportAllProjects).toHaveBeenCalledTimes(1);
    });
});
