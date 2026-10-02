import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import type { ContextMenu } from 'primereact/contextmenu';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarContextMenu } from '@/components/RootLayout/Sidebar/SidebarContextMenu';

vi.mock('@/components/ContextMenu/AppContextMenu', () => ({
    AppContextMenu: ({ model }: { model: readonly { label?: string; command?: () => void; disabled?: boolean }[] }) => (
        <nav aria-label='Sidebar context menu'>
            {model.map((item) => (
                <button
                    key={item.label}
                    type='button'
                    disabled={item.disabled}
                    onClick={item.command}>
                    {item.label}
                </button>
            ))}
        </nav>
    ),
}));

describe('SidebarContextMenu', () => {
    it('offers project export only when the account can manage requirements.', () => {
        const { rerender } = render(
            <SidebarContextMenu
                contextMenuRef={createRef<ContextMenu>()}
                canExportProject
                onExportProject={vi.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: 'Export project' })).toBeEnabled();
        expect(screen.queryByRole('button', { name: 'Export all projects' })).not.toBeInTheDocument();

        rerender(
            <SidebarContextMenu
                contextMenuRef={createRef<ContextMenu>()}
                canExportProject={false}
                onExportProject={vi.fn()}
            />,
        );
        expect(screen.getByRole('button', { name: 'Export project' })).toBeDisabled();
    });
});
