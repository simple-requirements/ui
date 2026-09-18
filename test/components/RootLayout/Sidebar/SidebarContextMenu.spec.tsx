import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import type { ContextMenu } from 'primereact/contextmenu';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';

vi.mock('@/components/ContextMenu/AppContextMenu', () => ({
    AppContextMenu: ({ model }: { model: readonly { label?: string; command?: () => void }[] }) => (
        <nav aria-label='Sidebar context menu'>
            {model.map((item) => (
                <button
                    key={item.label}
                    type='button'
                    onClick={item.command}>
                    {item.label}
                </button>
            ))}
        </nav>
    ),
}));

describe('SidebarContextMenu', () => {
    it('contains only project-workspace export actions.', () => {
        render(
            <SidebarContextMenu
                contextMenuRef={createRef<ContextMenu>()}
                onExportProject={vi.fn()}
                onExportAllProjects={vi.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: 'Export project' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Export all projects' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /rename project/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete project/i })).not.toBeInTheDocument();
    });
});
