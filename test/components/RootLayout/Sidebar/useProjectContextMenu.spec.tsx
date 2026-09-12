import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ContextMenu } from 'primereact/contextmenu';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SidebarProject } from '@/api/collections/projectsCollection';
import { useProjectContextMenu } from '@/components/RootLayout/Sidebar/useProjectContextMenu';

const projects: readonly SidebarProject[] = [
    {
        id: 'project-alpha',
        name: 'Alpha Project',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z',
        ticketUrlTemplate: null,
        requirementCount: 4,
    },
    {
        id: 'project-beta',
        name: 'Beta Project',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z',
        ticketUrlTemplate: null,
        requirementCount: 7,
    },
];

const mocks = vi.hoisted(() => ({ show: vi.fn() }));

interface WritableContextMenuRef {
    current: ContextMenu | null;
}

function ProjectContextMenuProbe() {
    const controller = useProjectContextMenu(projects);

    (controller.contextMenuRef as WritableContextMenuRef).current = { show: mocks.show } as unknown as ContextMenu;

    return (
        <div>
            <output aria-label='Context menu project'>{controller.contextMenuProject?.name ?? 'none'}</output>
            <button
                type='button'
                onContextMenu={(event) => controller.openProjectContextMenu('project-beta', event)}>
                Beta Project
            </button>
        </div>
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('useProjectContextMenu', () => {
    it('stores the project for the opened context menu and shows the PrimeReact menu.', () => {
        render(<ProjectContextMenuProbe />);

        fireEvent.contextMenu(screen.getByRole('button', { name: /beta project/i }));

        expect(screen.getByLabelText('Context menu project')).toHaveTextContent('Beta Project');
        expect(mocks.show).toHaveBeenCalledTimes(1);
    });
});
